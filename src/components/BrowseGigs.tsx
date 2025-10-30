/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit, useState } from '@devvit/public-api';
import { useTimebankState, saveState } from '../state/timebank.js';
import { StatusChip } from './StatusChip.js';
import { GigStatus, GigType } from '../types/gig.js';
import { GigService } from '../services/gigService.js';
import { UserService } from '../services/userService.js';

interface BrowseGigsProps {
  context: any;
}

export function BrowseGigs({ context }: BrowseGigsProps) {
  const [state, setState] = useTimebankState();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [acceptingGig, setAcceptingGig] = useState<string | null>(null);

  const handleAcceptGig = async (gigId: string) => {
    if (acceptingGig) return;
    
    setAcceptingGig(gigId);
    
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
      
      const result = GigService.acceptGig(currentState, gigId, userId, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        context.ui.showToast({ text: 'Gig accepted successfully!' });
      } else {
        context.ui.showToast({ text: result.error || 'Failed to accept gig' });
      }
    } catch (error) {
      context.ui.showToast({ text: 'Error accepting gig' });
    } finally {
      setAcceptingGig(null);
    }
  };

  // Get actual gigs from state
  const allGigs = Object.values(state.gigs);

  const categories = ['all', 'tech', 'creative', 'care', 'household', 'education'];

  const filteredGigs = selectedCategory === 'all' 
    ? allGigs 
    : allGigs.filter(gig => gig.category === selectedCategory);

  return (
    <vstack width="100%" gap="medium">
      {/* Header */}
      <vstack gap="small">
        <text size="large" weight="bold" color="#1e293b">
          Browse Available Gigs
        </text>
        <text size="medium" color="#64748b">
          Find opportunities to earn time credits
        </text>
      </vstack>

      {/* Category Filter */}
      <vstack gap="small">
        <hstack gap="small">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category}
              appearance={selectedCategory === category ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </hstack>
        <hstack gap="small">
          {categories.slice(4).map((category) => (
            <button
              key={category}
              appearance={selectedCategory === category ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </hstack>
      </vstack>

      {/* Gigs List */}
      <vstack gap="medium">
        {filteredGigs.length === 0 ? (
          <vstack alignment="center middle" padding="large">
            <text size="medium" color="#64748b">
              No gigs found in this category
            </text>
          </vstack>
        ) : (
          filteredGigs.map((gig) => (
            <vstack
              key={gig.id}
              backgroundColor="#ffffff"
              cornerRadius="medium"
              padding="medium"
              gap="small"
              border="thin"
              borderColor="#e2e8f0"
            >
              <hstack width="100%">
                <vstack grow>
                  <text size="medium" weight="bold" color="#1e293b">
                    {gig.title}
                  </text>
                </vstack>
                <StatusChip status={gig.status} />
              </hstack>
              
              <text size="small" color="#64748b">
                {gig.description}
              </text>
              
              <hstack width="100%">
                <hstack gap="small" alignment="center" grow>
                  <text size="small" color="#10b981" weight="bold">
                    {gig.timeCreditsOffered} credits
                  </text>
                  <text size="small" color="#64748b">
                    • {gig.estimatedDuration}min
                  </text>
                  <text size="small" color="#64748b">
                    • {gig.type === GigType.FIND_HELP ? '🔍 Find Help' : '🤝 Offer Help'}
                  </text>
                </hstack>
                
                {gig.status === GigStatus.OPEN && (
                  <button 
                    appearance="primary" 
                    size="small"
                    onPress={() => handleAcceptGig(gig.id)}
                    disabled={acceptingGig === gig.id}
                  >
                    {acceptingGig === gig.id ? 'Accepting...' : 'Accept'}
                  </button>
                )}
              </hstack>
            </vstack>
          ))
        )}
      </vstack>
    </vstack>
  );
}