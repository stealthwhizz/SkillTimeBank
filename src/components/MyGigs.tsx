/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit, useState } from '@devvit/public-api';
import { useTimebankState, saveState } from '../state/timebank.js';
import { StatusChip } from './StatusChip.js';
import { GigStatus, GigType } from '../types/gig.js';
import { TransactionType } from '../types/transaction.js';
import { GigService } from '../services/gigService.js';
import { UserService } from '../services/userService.js';

interface MyGigsProps {
  context: any;
}

export function MyGigs({ context }: MyGigsProps) {
  const [state, setState] = useTimebankState();
  const [activeTab, setActiveTab] = useState<'posted' | 'applied' | 'transactions'>('posted');
  const [processingGig, setProcessingGig] = useState<string | null>(null);

  const handleStartGig = async (gigId: string) => {
    if (processingGig) return;
    
    setProcessingGig(gigId);
    
    try {
      // Ensure user is registered
      const userResult = await UserService.ensureUserRegistered(state, context);
      if (!userResult.success || !userResult.userId || !userResult.newState) {
        context.ui.showToast({ text: userResult.error || 'Failed to register user' });
        return;
      }
      
      const userId = userResult.userId;
      const currentState = userResult.newState;
      setState(currentState);
      
      const result = GigService.startGig(currentState, gigId, userId, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        context.ui.showToast({ text: 'Gig started!' });
      } else {
        context.ui.showToast({ text: result.error || 'Failed to start gig' });
      }
    } catch (error) {
      context.ui.showToast({ text: 'Error starting gig' });
    } finally {
      setProcessingGig(null);
    }
  };

  const handleConfirmCompletion = async (gigId: string) => {
    if (processingGig) return;
    
    setProcessingGig(gigId);
    
    try {
      // Ensure user is registered
      const userResult = await UserService.ensureUserRegistered(state, context);
      if (!userResult.success || !userResult.userId || !userResult.newState) {
        context.ui.showToast({ text: userResult.error || 'Failed to register user' });
        return;
      }
      
      const userId = userResult.userId;
      const currentState = userResult.newState;
      setState(currentState);
      
      const result = GigService.confirmGigCompletion(currentState, gigId, userId, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        
        if (result.transactionId) {
          context.ui.showToast({ text: 'Gig completed and payment processed!' });
        } else {
          context.ui.showToast({ text: 'Gig completion confirmed!' });
        }
      } else {
        context.ui.showToast({ text: result.error || 'Failed to confirm completion' });
      }
    } catch (error) {
      context.ui.showToast({ text: 'Error confirming completion' });
    } finally {
      setProcessingGig(null);
    }
  };

  const getCurrentUserId = async () => {
    const currentUser = await context.reddit.getCurrentUser();
    return currentUser?.id || 'anonymous';
  };

  // Get actual gigs from state
  const allGigs = Object.values(state.gigs);
  const currentUserId = state.currentUser || 'anonymous';
  
  const postedGigs = allGigs.filter(gig => gig.createdBy === currentUserId);
  const appliedGigs = allGigs.filter(gig => gig.assignedTo === currentUserId);
  const userTransactions = UserService.getUserTransactions(state, currentUserId);
  
  const currentUser = state.users[currentUserId];

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.SIGNUP_BONUS:
        return '🎁 Signup Bonus';
      case TransactionType.ADMIN_AWARD:
        return '�  Admin Award';
      case TransactionType.GIG_PAYMENT:
        return '💰 Gig Payment';
      case TransactionType.BONUS:
        return '⭐ Bonus';
      case TransactionType.PENALTY:
        return '⚠️ Penalty';
      case TransactionType.REFUND:
        return '↩️ Refund';
      default:
        return '📄 Transaction';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <vstack width="100%" gap="medium">
      {/* Header */}
      <vstack gap="small">
        <hstack width="100%" >
          <vstack gap="small">
            <text size="large" weight="bold" color="#1e293b">
              My Gigs
            </text>
            <text size="medium" color="#64748b">
              Manage your gigs and transactions
            </text>
          </vstack>
          {currentUser && (
            <vstack alignment="end">
              <text size="small" color="#64748b">Balance</text>
              <text size="large" weight="bold" color="#10b981">
                {currentUser.timeCredits} TC
              </text>
            </vstack>
          )}
        </hstack>
      </vstack>

      {/* Tab Selector */}
      <hstack gap="small">
        <button
          appearance={activeTab === 'posted' ? 'primary' : 'secondary'}
          size="small"
          onPress={() => setActiveTab('posted')}
        >
          Posted ({postedGigs.length})
        </button>
        <button
          appearance={activeTab === 'applied' ? 'primary' : 'secondary'}
          size="small"
          onPress={() => setActiveTab('applied')}
        >
          Applied ({appliedGigs.length})
        </button>
        <button
          appearance={activeTab === 'transactions' ? 'primary' : 'secondary'}
          size="small"
          onPress={() => setActiveTab('transactions')}
        >
          Transactions ({userTransactions.length})
        </button>
      </hstack>

      {/* Content */}
      <vstack gap="medium">
        {activeTab === 'posted' ? (
          postedGigs.length === 0 ? (
            <vstack alignment="center middle" padding="large">
              <text size="medium" color="#64748b">
                You haven't posted any gigs yet
              </text>
            </vstack>
          ) : (
            postedGigs.map((gig) => (
              <vstack
                key={gig.id}
                backgroundColor="#ffffff"
                cornerRadius="medium"
                padding="medium"
                gap="small"
                border="thin"
                borderColor="#e2e8f0"
              >
                <hstack width="100%" >
                  <text size="medium" weight="bold" color="#1e293b">
                    {gig.title}
                  </text>
                  <StatusChip status={gig.status} />
                </hstack>
                
                <text size="small" color="#64748b">
                  {gig.description}
                </text>
                
                <hstack width="100%" >
                  <hstack gap="small" alignment="center">
                    <text size="small" color="#10b981" weight="bold">
                      {gig.timeCreditsOffered} credits
                    </text>
                    <text size="small" color="#64748b">
                      • {gig.type === GigType.FIND_HELP ? '🔍 Find Help' : '🤝 Offer Help'}
                    </text>
                  </hstack>
                  
                  {(gig.status === GigStatus.ASSIGNED || gig.status === GigStatus.IN_PROGRESS || gig.status === GigStatus.AWAITING_CONFIRMATION) && (
                    <button 
                      appearance="primary" 
                      size="small"
                      onPress={() => handleConfirmCompletion(gig.id)}
                      disabled={processingGig === gig.id}
                    >
                      {processingGig === gig.id ? 'Processing...' : 'Confirm Complete'}
                    </button>
                  )}
                </hstack>
              </vstack>
            ))
          )
        ) : activeTab === 'applied' ? (
          appliedGigs.length === 0 ? (
            <vstack alignment="center middle" padding="large">
              <text size="medium" color="#64748b">
                You haven't applied to any gigs yet
              </text>
            </vstack>
          ) : (
            appliedGigs.map((gig) => (
              <vstack
                key={gig.id}
                backgroundColor="#ffffff"
                cornerRadius="medium"
                padding="medium"
                gap="small"
                border="thin"
                borderColor="#e2e8f0"
              >
                <hstack width="100%" >
                  <text size="medium" weight="bold" color="#1e293b">
                    {gig.title}
                  </text>
                  <StatusChip status={gig.status} />
                </hstack>
                
                <text size="small" color="#64748b">
                  {gig.description}
                </text>
                
                <hstack width="100%" >
                  <hstack gap="small" alignment="center">
                    <text size="small" color="#10b981" weight="bold">
                      {gig.timeCreditsOffered} credits
                    </text>
                    <text size="small" color="#64748b">
                      • {gig.type === GigType.FIND_HELP ? '🔍 Find Help' : '🤝 Offer Help'}
                    </text>
                  </hstack>
                  
                  {gig.status === GigStatus.ASSIGNED && (
                    <button 
                      appearance="primary" 
                      size="small"
                      onPress={() => handleStartGig(gig.id)}
                      disabled={processingGig === gig.id}
                    >
                      {processingGig === gig.id ? 'Starting...' : 'Start Work'}
                    </button>
                  )}
                  
                  {(gig.status === GigStatus.IN_PROGRESS || gig.status === GigStatus.AWAITING_CONFIRMATION) && (
                    <button 
                      appearance="primary" 
                      size="small"
                      onPress={() => handleConfirmCompletion(gig.id)}
                      disabled={processingGig === gig.id}
                    >
                      {processingGig === gig.id ? 'Processing...' : 'Mark Complete'}
                    </button>
                  )}
                </hstack>
              </vstack>
            ))
          )
        ) : activeTab === 'transactions' ? (
          userTransactions.length === 0 ? (
            <vstack alignment="center middle" padding="large">
              <text size="medium" color="#64748b">
                No transactions yet
              </text>
            </vstack>
          ) : (
            userTransactions.map((transaction) => {
              const isIncoming = transaction.toUserId === currentUserId;
              const otherUserId = isIncoming ? transaction.fromUserId : transaction.toUserId;
              const otherUser = state.users[otherUserId];
              const gig = transaction.gigId ? state.gigs[transaction.gigId] : null;
              
              return (
                <vstack
                  key={transaction.id}
                  backgroundColor="#ffffff"
                  cornerRadius="medium"
                  padding="medium"
                  gap="small"
                  border="thin"
                  borderColor="#e2e8f0"
                >
                  <hstack width="100%">
                    <text size="medium" weight="bold" color="#1e293b">
                      {getTransactionTypeLabel(transaction.type)}
                    </text>
                    <spacer />
                    <text 
                      size="medium" 
                      weight="bold" 
                      color={isIncoming ? "#10b981" : "#ef4444"}
                    >
                      {isIncoming ? '+' : '-'}{transaction.amount} TC
                    </text>
                  </hstack>
                  
                  {transaction.description ? (
                    <text size="small" color="#64748b">
                      {transaction.description}
                    </text>
                  ) : null}
                  
                  {gig && (
                    <text size="small" color="#64748b">
                      Gig: {gig.title}
                    </text>
                  )}
                  
                  {otherUser && otherUser.id !== 'system' && (
                    <text size="small" color="#64748b">
                      {isIncoming ? 'From' : 'To'}: {otherUser.username}
                    </text>
                  )}
                  
                  <hstack width="100%">
                    <text size="small" color="#9ca3af">
                      {formatDate(transaction.createdAt)}
                    </text>
                    <spacer />
                    <text 
                      size="small" 
                      color={transaction.status === 'completed' ? '#10b981' : '#f59e0b'}
                    >
                      {transaction.status.toUpperCase()}
                    </text>
                  </hstack>
                </vstack>
              );
            })
          )
        ) : null}
      </vstack>
    </vstack>
  );
}
