import { Gig, GigStatus, GigType } from '../types/gig.js';
import { User } from '../types/user.js';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction.js';
import { TimebankState } from '../state/timebank.js';

export class GigService {
  
  static createGig(
    state: TimebankState, 
    gig: Omit<Gig, 'id' | 'createdAt' | 'status'>,
    context: any
  ): { success: boolean; gigId?: string; error?: string; newState?: TimebankState } {
    try {
      const creator = state.users[gig.createdBy];
      if (!creator) {
        return { success: false, error: 'User not found' };
      }

      // Stricter validation: Title must be at least 10 characters
      if (!gig.title || gig.title.trim().length < 10) {
        return { 
          success: false, 
          error: 'Title must be at least 10 characters long' 
        };
      }

      // Stricter validation: Description must be at least 20 characters
      if (!gig.description || gig.description.trim().length < 20) {
        return { 
          success: false, 
          error: 'Description must be at least 20 characters long' 
        };
      }

      // For FIND_HELP gigs, check if poster has sufficient balance
      if (gig.type === GigType.FIND_HELP && creator.timeCredits < gig.timeCreditsOffered) {
        return { 
          success: false, 
          error: `Insufficient time credits. You have ${creator.timeCredits}, but need ${gig.timeCreditsOffered}` 
        };
      }

      const gigId = `gig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newGig: Gig = {
        ...gig,
        id: gigId,
        createdAt: new Date(),
        status: GigStatus.OPEN
      };

      const newState = {
        ...state,
        gigs: {
          ...state.gigs,
          [gigId]: newGig
        }
      };

      return { success: true, gigId, newState };
    } catch (error) {
      return { success: false, error: 'Failed to create gig' };
    }
  }

  static acceptGig(
    state: TimebankState,
    gigId: string,
    userId: string,
    context: any
  ): { success: boolean; error?: string; newState?: TimebankState } {
    try {
      const gig = state.gigs[gigId];
      if (!gig) {
        return { success: false, error: 'Gig not found' };
      }

      const user = state.users[userId];
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Validation: No self-accept
      if (gig.createdBy === userId) {
        return { success: false, error: 'Cannot accept your own gig' };
      }

      // Check if gig is available
      if (gig.status !== GigStatus.OPEN) {
        return { success: false, error: 'Gig is no longer available' };
      }

      // Update gig status atomically
      const updatedGig: Gig = {
        ...gig,
        status: GigStatus.ASSIGNED,
        assignedTo: userId
      };

      const newState = {
        ...state,
        gigs: {
          ...state.gigs,
          [gigId]: updatedGig
        }
      };

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to accept gig' };
    }
  }

  static confirmGigCompletion(
    state: TimebankState,
    gigId: string,
    confirmingUserId: string,
    context: any
  ): { success: boolean; error?: string; newState?: TimebankState; transactionId?: string } {
    try {
      const gig = state.gigs[gigId];
      if (!gig) {
        return { success: false, error: 'Gig not found' };
      }

      const confirmingUser = state.users[confirmingUserId];
      if (!confirmingUser) {
        return { success: false, error: 'User not found' };
      }

      // Check if user can confirm completion
      const canConfirm = gig.createdBy === confirmingUserId || gig.assignedTo === confirmingUserId;
      if (!canConfirm) {
        return { success: false, error: 'Only gig creator or assignee can confirm completion' };
      }

      // Check if already completed (idempotent)
      if (gig.status === GigStatus.COMPLETED) {
        return { success: true, newState: state }; // Ignore repeat confirmations
      }

      // Check if gig is in correct status
      if (gig.status !== GigStatus.ASSIGNED && gig.status !== GigStatus.IN_PROGRESS && gig.status !== GigStatus.AWAITING_CONFIRMATION) {
        return { success: false, error: 'Gig must be assigned, in progress, or awaiting confirmation to confirm completion' };
      }

      // Update gig to awaiting confirmation or completed
      let newStatus: GigStatus;
      if (gig.status === GigStatus.ASSIGNED) {
        newStatus = GigStatus.AWAITING_CONFIRMATION;
      } else if (gig.status === GigStatus.AWAITING_CONFIRMATION || gig.status === GigStatus.IN_PROGRESS) {
        newStatus = GigStatus.COMPLETED;
      } else {
        newStatus = gig.status; // Should not reach here due to earlier validation
      }

      const updatedGig: Gig = {
        ...gig,
        status: newStatus,
        completedAt: newStatus === GigStatus.COMPLETED ? new Date() : gig.completedAt
      };

      let newState = {
        ...state,
        gigs: {
          ...state.gigs,
          [gigId]: updatedGig
        }
      };

      // If completed, execute payment
      let transactionId: string | undefined;
      if (newStatus === GigStatus.COMPLETED) {
        const paymentResult = this.executePayment(newState, gigId, context);
        if (paymentResult.success && paymentResult.newState) {
          newState = paymentResult.newState;
          transactionId = paymentResult.transactionId;
        } else {
          return { success: false, error: paymentResult.error || 'Payment failed' };
        }
      }

      return { success: true, newState, transactionId };
    } catch (error) {
      return { success: false, error: 'Failed to confirm gig completion' };
    }
  }

  static executePayment(
    state: TimebankState,
    gigId: string,
    context: any
  ): { success: boolean; error?: string; newState?: TimebankState; transactionId?: string } {
    try {
      const gig = state.gigs[gigId];
      if (!gig || !gig.assignedTo) {
        return { success: false, error: 'Invalid gig for payment' };
      }

      const creator = state.users[gig.createdBy];
      const assignee = state.users[gig.assignedTo];

      if (!creator || !assignee) {
        return { success: false, error: 'Users not found for payment' };
      }

      // Check for existing transaction (idempotent payment)
      const existingTransaction = Object.values(state.transactions).find(
        tx => tx.gigId === gigId && tx.type === TransactionType.GIG_PAYMENT
      );

      if (existingTransaction) {
        if (existingTransaction.status === TransactionStatus.COMPLETED) {
          return { success: true, newState: state, transactionId: existingTransaction.id };
        }
        if (existingTransaction.status === TransactionStatus.PENDING) {
          // Process existing pending transaction
          return this.processTransaction(state, existingTransaction.id, context);
        }
      }

      // Determine payment direction based on gig type
      let fromUserId: string;
      let toUserId: string;

      if (gig.type === GigType.FIND_HELP) {
        // Creator pays assignee
        fromUserId = gig.createdBy;
        toUserId = gig.assignedTo;
      } else {
        // Assignee pays creator (OFFER_HELP)
        fromUserId = gig.assignedTo;
        toUserId = gig.createdBy;
      }

      const fromUser = state.users[fromUserId];
      
      // Check sufficient balance
      if (fromUser.timeCredits < gig.timeCreditsOffered) {
        return { 
          success: false, 
          error: `Insufficient time credits. ${fromUser.username} has ${fromUser.timeCredits}, but needs ${gig.timeCreditsOffered}` 
        };
      }

      // Create transaction
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const transaction: Transaction = {
        id: transactionId,
        fromUserId,
        toUserId,
        gigId,
        amount: gig.timeCreditsOffered,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: `Payment for gig: ${gig.title}`
      };

      const stateWithTransaction = {
        ...state,
        transactions: {
          ...state.transactions,
          [transactionId]: transaction
        }
      };

      // Process the transaction immediately
      return this.processTransaction(stateWithTransaction, transactionId, context);
    } catch (error) {
      return { success: false, error: 'Failed to execute payment' };
    }
  }

  static processTransaction(
    state: TimebankState,
    transactionId: string,
    context: any
  ): { success: boolean; error?: string; newState?: TimebankState; transactionId?: string } {
    try {
      const transaction = state.transactions[transactionId];
      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Idempotent - if already completed, return success
      if (transaction.status === TransactionStatus.COMPLETED) {
        return { success: true, newState: state, transactionId };
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        return { success: false, error: 'Transaction is not in pending status' };
      }

      const fromUser = state.users[transaction.fromUserId];
      const toUser = state.users[transaction.toUserId];

      if (!fromUser || !toUser) {
        const failedTransaction = {
          ...transaction,
          status: TransactionStatus.FAILED
        };
        
        const newState = {
          ...state,
          transactions: {
            ...state.transactions,
            [transactionId]: failedTransaction
          }
        };
        
        return { success: false, error: 'Users not found', newState };
      }

      // Final balance check
      if (fromUser.timeCredits < transaction.amount) {
        const failedTransaction = {
          ...transaction,
          status: TransactionStatus.FAILED
        };
        
        const newState = {
          ...state,
          transactions: {
            ...state.transactions,
            [transactionId]: failedTransaction
          }
        };
        
        return { success: false, error: 'Insufficient balance', newState };
      }

      // Execute atomic transfer
      const updatedFromUser: User = {
        ...fromUser,
        timeCredits: fromUser.timeCredits - transaction.amount
      };

      const updatedToUser: User = {
        ...toUser,
        timeCredits: toUser.timeCredits + transaction.amount
      };

      const completedTransaction: Transaction = {
        ...transaction,
        status: TransactionStatus.COMPLETED,
        completedAt: new Date()
      };

      const newState: TimebankState = {
        ...state,
        users: {
          ...state.users,
          [transaction.fromUserId]: updatedFromUser,
          [transaction.toUserId]: updatedToUser
        },
        transactions: {
          ...state.transactions,
          [transactionId]: completedTransaction
        }
      };

      return { success: true, newState, transactionId };
    } catch (error) {
      return { success: false, error: 'Failed to process transaction' };
    }
  }

  static startGig(
    state: TimebankState,
    gigId: string,
    userId: string,
    context: any
  ): { success: boolean; error?: string; newState?: TimebankState } {
    try {
      const gig = state.gigs[gigId];
      if (!gig) {
        return { success: false, error: 'Gig not found' };
      }

      if (gig.assignedTo !== userId) {
        return { success: false, error: 'Only assigned user can start the gig' };
      }

      if (gig.status !== GigStatus.ASSIGNED) {
        return { success: false, error: 'Gig must be assigned to start' };
      }

      const updatedGig: Gig = {
        ...gig,
        status: GigStatus.IN_PROGRESS
      };

      const newState = {
        ...state,
        gigs: {
          ...state.gigs,
          [gigId]: updatedGig
        }
      };

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to start gig' };
    }
  }
}