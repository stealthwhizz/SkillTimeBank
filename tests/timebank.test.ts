import { describe, it, expect, beforeEach } from 'vitest';
import { GigService } from '../src/services/gigService';
import { UserService } from '../src/services/userService';
import { TimebankState } from '../src/state/timebank';
import { User } from '../src/types/user';
import { GigStatus, GigCategory, GigType } from '../src/types/gig';
import { TransactionType, TransactionStatus } from '../src/types/transaction';

describe('GigService Unit Tests', () => {
  let initialState: TimebankState;
  let alice: User;
  let bob: User;
  let testGig: Omit<import('../src/types/gig.js').Gig, 'id' | 'createdAt' | 'status'>;
  let mockContext: any;

  beforeEach(() => {
    alice = {
      id: 'alice',
      username: 'alice',
      timeCredits: 100,
      reputation: 5,
      skills: ['programming'],
      joinedAt: new Date(),
      isActive: true
    };

    bob = {
      id: 'bob',
      username: 'bob',
      timeCredits: 50,
      reputation: 4,
      skills: ['design'],
      joinedAt: new Date(),
      isActive: true
    };

    testGig = {
      title: 'Build a website',
      description: 'Need a simple website built',
      category: GigCategory.TECH,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 30,
      estimatedDuration: 120,
      requiredSkills: ['programming'],
      isRemote: true,
      createdBy: alice.id
    };

    initialState = {
      users: {
        [alice.id]: alice,
        [bob.id]: bob
      },
      gigs: {},
      transactions: {},
      currentUser: alice.id
    };

    mockContext = {
      reddit: {
        getCurrentUser: () => Promise.resolve({ id: alice.id, username: alice.username })
      },
      redis: {
        set: () => Promise.resolve(),
        get: () => Promise.resolve(null)
      }
    };
  });

  describe('Gig Creation and Management', () => {
    it('should create a gig successfully', () => {
      const result = GigService.createGig(initialState, testGig, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.gigId).toBeDefined();
      expect(result.newState).toBeDefined();
      
      if (result.newState && result.gigId) {
        const createdGig = result.newState.gigs[result.gigId];
        expect(createdGig.title).toBe(testGig.title);
        expect(createdGig.status).toBe(GigStatus.OPEN);
        expect(createdGig.createdBy).toBe(alice.id);
      }
    });

    it('should prevent creating FIND_HELP gig with insufficient balance', () => {
      const expensiveGig = { ...testGig, timeCreditsOffered: 200 }; // More than alice's 100 credits
      const result = GigService.createGig(initialState, expensiveGig, mockContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient time credits');
    });

    it('should allow creating OFFER_HELP gig without balance check', () => {
      const offerGig = { ...testGig, type: GigType.OFFER_HELP, timeCreditsOffered: 200 };
      const result = GigService.createGig(initialState, offerGig, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.gigId).toBeDefined();
    });

    it('should fail when user not found', () => {
      const invalidGig = { ...testGig, createdBy: 'nonexistent' };
      const result = GigService.createGig(initialState, invalidGig, mockContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('Gig Acceptance', () => {
    it('should prevent user from accepting their own gig', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, alice.id, mockContext);
        expect(acceptResult.success).toBe(false);
        expect(acceptResult.error).toBe('Cannot accept your own gig');
      }
    });

    it('should successfully accept available gig', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        expect(acceptResult.success).toBe(true);
        expect(acceptResult.newState).toBeDefined();
        
        if (acceptResult.newState) {
          const acceptedGig = acceptResult.newState.gigs[createResult.gigId];
          expect(acceptedGig.status).toBe(GigStatus.ASSIGNED);
          expect(acceptedGig.assignedTo).toBe(bob.id);
        }
      }
    });

    it('should fail when gig not found', () => {
      const result = GigService.acceptGig(initialState, 'nonexistent', bob.id, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Gig not found');
    });

    it('should fail when user not found', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      if (createResult.newState && createResult.gigId) {
        const result = GigService.acceptGig(createResult.newState, createResult.gigId, 'nonexistent', mockContext);
        expect(result.success).toBe(false);
        expect(result.error).toBe('User not found');
      }
    });
  });

  describe('Double-Accept Race Condition', () => {
    it('should prevent double acceptance of the same gig', () => {
      const charlie: User = {
        id: 'charlie',
        username: 'charlie',
        timeCredits: 75,
        reputation: 3,
        skills: ['writing'],
        joinedAt: new Date(),
        isActive: true
      };

      const stateWithCharlie = {
        ...initialState,
        users: { ...initialState.users, [charlie.id]: charlie }
      };

      const createResult = GigService.createGig(stateWithCharlie, testGig, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        // First acceptance should succeed
        const firstAccept = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        expect(firstAccept.success).toBe(true);
        
        if (firstAccept.newState) {
          // Second acceptance should fail
          const secondAccept = GigService.acceptGig(firstAccept.newState, createResult.gigId, charlie.id, mockContext);
          expect(secondAccept.success).toBe(false);
          expect(secondAccept.error).toBe('Gig is no longer available');
        }
      }
    });
  });

  describe('Payment Processing', () => {
    it('should prevent payment when user has insufficient credits', () => {
      const poorUser: User = {
        id: 'poor',
        username: 'poor',
        timeCredits: 10, // Less than gig payment
        reputation: 1,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };
      
      const stateWithPoorUser = {
        ...initialState,
        users: { ...initialState.users, [poorUser.id]: poorUser }
      };

      const expensiveGig = { ...testGig, createdBy: poorUser.id, timeCreditsOffered: 50 };
      const createResult = GigService.createGig(stateWithPoorUser, expensiveGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, bob.id, mockContext);
          
          if (startResult.newState) {
            const completeResult = GigService.confirmGigCompletion(startResult.newState, createResult.gigId, bob.id, mockContext);
            expect(completeResult.success).toBe(false);
            expect(completeResult.error).toContain('Insufficient time credits');
          }
        }
      }
    });

    it('should successfully process payment with sufficient balance', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, bob.id, mockContext);
          
          if (startResult.newState) {
            const completeResult = GigService.confirmGigCompletion(startResult.newState, createResult.gigId, alice.id, mockContext);
            expect(completeResult.success).toBe(true);
            expect(completeResult.transactionId).toBeDefined();
            
            if (completeResult.newState) {
              // Check that payment was processed
              const updatedAlice = completeResult.newState.users[alice.id];
              const updatedBob = completeResult.newState.users[bob.id];
              expect(updatedAlice.timeCredits).toBe(70); // 100 - 30
              expect(updatedBob.timeCredits).toBe(80);   // 50 + 30
            }
          }
        }
      }
    });
  });

  describe('Gig State Transitions', () => {
    it('should successfully start an assigned gig', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, bob.id, mockContext);
          expect(startResult.success).toBe(true);
          
          if (startResult.newState) {
            const startedGig = startResult.newState.gigs[createResult.gigId];
            expect(startedGig.status).toBe(GigStatus.IN_PROGRESS);
          }
        }
      }
    });

    it('should prevent starting gig by non-assigned user', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, alice.id, mockContext);
          expect(startResult.success).toBe(false);
          expect(startResult.error).toBe('Only assigned user can start the gig');
        }
      }
    });

    it('should prevent starting non-assigned gig', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const startResult = GigService.startGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        expect(startResult.success).toBe(false);
        expect(startResult.error).toBe('Only assigned user can start the gig');
      }
    });
  });

  describe('Idempotent Payment (No Double-Pay)', () => {
    it('should not process the same transaction twice', () => {
      const transaction = {
        id: 'tx2',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: 'test-gig',
        amount: 30,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Test payment'
      };

      const stateWithTransaction = {
        ...initialState,
        transactions: { [transaction.id]: transaction }
      };
      
      // Process transaction first time
      const firstResult = GigService.processTransaction(stateWithTransaction, transaction.id, mockContext);
      expect(firstResult.success).toBe(true);
      
      if (firstResult.newState) {
        const aliceAfterFirst = firstResult.newState.users[alice.id];
        const bobAfterFirst = firstResult.newState.users[bob.id];
        expect(aliceAfterFirst.timeCredits).toBe(70); // 100 - 30
        expect(bobAfterFirst.timeCredits).toBe(80);   // 50 + 30
        
        // Process transaction second time (should be idempotent)
        const secondResult = GigService.processTransaction(firstResult.newState, transaction.id, mockContext);
        expect(secondResult.success).toBe(true);
        
        if (secondResult.newState) {
          const aliceAfterSecond = secondResult.newState.users[alice.id];
          const bobAfterSecond = secondResult.newState.users[bob.id];
          expect(aliceAfterSecond.timeCredits).toBe(70); // No change
          expect(bobAfterSecond.timeCredits).toBe(80);   // No change
        }
      }
    });

    it('should handle transaction with insufficient balance', () => {
      const transaction = {
        id: 'tx3',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: 'test-gig',
        amount: 200, // More than alice's 100 credits
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Expensive payment'
      };

      const stateWithTransaction = {
        ...initialState,
        transactions: { [transaction.id]: transaction }
      };
      
      const result = GigService.processTransaction(stateWithTransaction, transaction.id, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient balance');
      
      if (result.newState) {
        const failedTransaction = result.newState.transactions[transaction.id];
        expect(failedTransaction.status).toBe(TransactionStatus.FAILED);
      }
    });
  });

  describe('Gig Completion Confirmation', () => {
    it('should handle dual confirmation process', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          // First confirmation from ASSIGNED should set to AWAITING_CONFIRMATION
          const firstConfirm = GigService.confirmGigCompletion(acceptResult.newState, createResult.gigId, alice.id, mockContext);
          expect(firstConfirm.success).toBe(true);
          
          if (firstConfirm.newState) {
            const gigAfterFirst = firstConfirm.newState.gigs[createResult.gigId];
            expect(gigAfterFirst.status).toBe(GigStatus.AWAITING_CONFIRMATION);
            
            // Second confirmation should complete and process payment
            const secondConfirm = GigService.confirmGigCompletion(firstConfirm.newState, createResult.gigId, bob.id, mockContext);
            expect(secondConfirm.success).toBe(true);
            expect(secondConfirm.transactionId).toBeDefined();
            
            if (secondConfirm.newState) {
              const completedGig = secondConfirm.newState.gigs[createResult.gigId];
              expect(completedGig.status).toBe(GigStatus.COMPLETED);
              expect(completedGig.completedAt).toBeDefined();
            }
          }
        }
      }
    });

    it('should prevent confirmation by unauthorized user', () => {
      const charlie: User = {
        id: 'charlie',
        username: 'charlie',
        timeCredits: 75,
        reputation: 3,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };

      const stateWithCharlie = {
        ...initialState,
        users: { ...initialState.users, [charlie.id]: charlie }
      };

      const createResult = GigService.createGig(stateWithCharlie, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const confirmResult = GigService.confirmGigCompletion(acceptResult.newState, createResult.gigId, charlie.id, mockContext);
          expect(confirmResult.success).toBe(false);
          expect(confirmResult.error).toBe('Only gig creator or assignee can confirm completion');
        }
      }
    });

    it('should ignore repeat confirmations (idempotent)', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, bob.id, mockContext);
          
          if (startResult.newState) {
            // First confirmation from ASSIGNED (sets to AWAITING_CONFIRMATION)
            const firstConfirm = GigService.confirmGigCompletion(startResult.newState, createResult.gigId, alice.id, mockContext);
            expect(firstConfirm.success).toBe(true);
            
            if (firstConfirm.newState) {
              // Second confirmation (completes the gig)
              const secondConfirm = GigService.confirmGigCompletion(firstConfirm.newState, createResult.gigId, bob.id, mockContext);
              expect(secondConfirm.success).toBe(true);
              
              if (secondConfirm.newState) {
                // Try to confirm again (should be idempotent)
                const repeatResult = GigService.confirmGigCompletion(secondConfirm.newState, createResult.gigId, alice.id, mockContext);
                expect(repeatResult.success).toBe(true);
                
                // Check that the gig status remains COMPLETED
                if (repeatResult.newState) {
                  const gigAfterRepeat = repeatResult.newState.gigs[createResult.gigId];
                  expect(gigAfterRepeat.status).toBe(GigStatus.COMPLETED);
                }
              }
            }
          }
        }
      }
    });

    it('should handle confirmation from AWAITING_CONFIRMATION status', () => {
      const createResult = GigService.createGig(initialState, testGig, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          // First confirmation from ASSIGNED (sets to AWAITING_CONFIRMATION)
          const firstConfirm = GigService.confirmGigCompletion(acceptResult.newState, createResult.gigId, alice.id, mockContext);
          expect(firstConfirm.success).toBe(true);
          expect(firstConfirm.transactionId).toBeUndefined(); // No transaction yet
          
          if (firstConfirm.newState) {
            const gigAfterFirst = firstConfirm.newState.gigs[createResult.gigId];
            expect(gigAfterFirst.status).toBe(GigStatus.AWAITING_CONFIRMATION);
            
            // Confirmation from AWAITING_CONFIRMATION should complete and process payment
            const secondConfirm = GigService.confirmGigCompletion(firstConfirm.newState, createResult.gigId, bob.id, mockContext);
            expect(secondConfirm.success).toBe(true);
            expect(secondConfirm.transactionId).toBeDefined();
            
            if (secondConfirm.newState) {
              const completedGig = secondConfirm.newState.gigs[createResult.gigId];
              expect(completedGig.status).toBe(GigStatus.COMPLETED);
              expect(completedGig.completedAt).toBeDefined();
              
              // Verify payment was processed
              expect(secondConfirm.newState.users[alice.id]?.timeCredits).toBe(70); // 100 - 30
              expect(secondConfirm.newState.users[bob.id]?.timeCredits).toBe(80);   // 50 + 30
            }
          }
        }
      }
    });
  });

  describe('Transaction Processing Edge Cases', () => {
    it('should handle missing transaction', () => {
      const result = GigService.processTransaction(initialState, 'nonexistent', mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction not found');
    });

    it('should handle missing users in transaction', () => {
      const transaction = {
        id: 'tx4',
        fromUserId: 'nonexistent1',
        toUserId: 'nonexistent2',
        gigId: 'test-gig',
        amount: 25,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Invalid payment'
      };

      const stateWithTransaction = {
        ...initialState,
        transactions: { [transaction.id]: transaction }
      };
      
      const result = GigService.processTransaction(stateWithTransaction, transaction.id, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Users not found');
      
      if (result.newState) {
        const failedTransaction = result.newState.transactions[transaction.id];
        expect(failedTransaction.status).toBe(TransactionStatus.FAILED);
      }
    });

    it('should not process non-pending transaction', () => {
      const transaction = {
        id: 'tx5',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: 'test-gig',
        amount: 25,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.FAILED,
        createdAt: new Date(),
        description: 'Failed payment'
      };

      const stateWithTransaction = {
        ...initialState,
        transactions: { [transaction.id]: transaction }
      };
      
      const result = GigService.processTransaction(stateWithTransaction, transaction.id, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction is not in pending status');
    });
  });
});

describe('UserService Unit Tests', () => {
  let initialState: TimebankState;
  let mockContext: any;

  beforeEach(() => {
    initialState = {
      users: {},
      gigs: {},
      transactions: {},
      currentUser: undefined
    };

    mockContext = {
      reddit: {
        getCurrentUser: () => Promise.resolve({ id: 'user123', username: 'testuser' })
      },
      redis: {
        set: () => Promise.resolve(),
        get: () => Promise.resolve(null)
      }
    };
  });

  describe('User Registration', () => {
    it('should register new user with signup bonus', async () => {
      const result = await UserService.registerUser(initialState, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.newState).toBeDefined();
      
      if (result.user && result.newState) {
        expect(result.user.id).toBe('user123');
        expect(result.user.username).toBe('testuser');
        expect(result.user.timeCredits).toBe(UserService.SIGNUP_BONUS_AMOUNT);
        expect(result.user.reputation).toBe(0);
        
        // Check signup bonus transaction was created
        const transactions = Object.values(result.newState.transactions);
        expect(transactions).toHaveLength(1);
        
        const signupTx = transactions[0];
        expect(signupTx.type).toBe(TransactionType.SIGNUP_BONUS);
        expect(signupTx.amount).toBe(UserService.SIGNUP_BONUS_AMOUNT);
        expect(signupTx.status).toBe(TransactionStatus.COMPLETED);
        expect(signupTx.toUserId).toBe('user123');
        expect(signupTx.fromUserId).toBe(UserService.SYSTEM_USER_ID);
      }
    });

    it('should return existing user if already registered', async () => {
      const existingUser: User = {
        id: 'user123',
        username: 'testuser',
        timeCredits: 50,
        reputation: 5,
        skills: ['programming'],
        joinedAt: new Date(),
        isActive: true
      };

      const stateWithUser = {
        ...initialState,
        users: { [existingUser.id]: existingUser }
      };

      const result = await UserService.registerUser(stateWithUser, mockContext);
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual(existingUser);
      expect(result.newState).toEqual(stateWithUser);
    });

    it('should handle registration failure', async () => {
      const failingContext = {
        reddit: {
          getCurrentUser: () => Promise.resolve(null)
        }
      };

      const result = await UserService.registerUser(initialState, failingContext);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unable to get current user');
    });
  });

  describe('User Transaction History', () => {
    it('should return user transactions sorted by date', () => {
      const user: User = {
        id: 'user123',
        username: 'testuser',
        timeCredits: 100,
        reputation: 5,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };

      const oldTransaction = {
        id: 'tx1',
        fromUserId: 'user123',
        toUserId: 'other',
        gigId: 'gig1',
        amount: 10,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.COMPLETED,
        createdAt: new Date('2023-01-01'),
        description: 'Old payment'
      };

      const newTransaction = {
        id: 'tx2',
        fromUserId: 'other',
        toUserId: 'user123',
        gigId: 'gig2',
        amount: 20,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.COMPLETED,
        createdAt: new Date('2023-01-02'),
        description: 'New payment'
      };

      const stateWithTransactions = {
        ...initialState,
        users: { [user.id]: user },
        transactions: {
          [oldTransaction.id]: oldTransaction,
          [newTransaction.id]: newTransaction
        }
      };

      const transactions = UserService.getUserTransactions(stateWithTransactions, 'user123');
      
      expect(transactions).toHaveLength(2);
      expect(transactions[0].id).toBe('tx2'); // Newer transaction first
      expect(transactions[1].id).toBe('tx1'); // Older transaction second
    });

    it('should return empty array for user with no transactions', () => {
      const transactions = UserService.getUserTransactions(initialState, 'user123');
      expect(transactions).toHaveLength(0);
    });
  });
});