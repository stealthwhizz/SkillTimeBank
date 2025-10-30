/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { LeaderboardEntry, LeaderboardCategory } from '../types/leaderboard.js';

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  category: LeaderboardCategory;
  currentUserId?: string;
}

export function LeaderboardDisplay({ entries, category, currentUserId }: LeaderboardDisplayProps) {
  
  const getCategoryTitle = (cat: LeaderboardCategory) => {
    const titles: Record<LeaderboardCategory, string> = {
      [LeaderboardCategory.TOP_HELPERS]: '🏆 Top Helpers',
      [LeaderboardCategory.FASTEST_RESPONDERS]: '⚡ Fastest Responders',
      [LeaderboardCategory.DIVERSE_SKILLERS]: '🌈 Most Versatile',
      [LeaderboardCategory.WEEKLY_CHAMPIONS]: '⭐ Weekly Champions'
    };
    return titles[cat];
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatScore = (entry: LeaderboardEntry) => {
    if (category === LeaderboardCategory.FASTEST_RESPONDERS) {
      const minutes = entry.metadata?.avgResponseMinutes || entry.score;
      if (minutes < 60) return `${Math.round(minutes)}m avg`;
      return `${(minutes / 60).toFixed(1)}h avg`;
    }
    
    if (category === LeaderboardCategory.DIVERSE_SKILLERS) {
      return `${entry.score} categories`;
    }
    
    return `${entry.score} gigs`;
  };

  return (
    <vstack width="100%" gap="medium">
      {/* Header */}
      <vstack width="100%" gap="small">
        <text size="large" weight="bold" color="#1e293b">
          {getCategoryTitle(category)}
        </text>
        <text size="small" color="#64748b">
          Updated in real-time
        </text>
      </vstack>

      {/* Leaderboard Entries */}
      <vstack width="100%" gap="small">
        {entries.length === 0 ? (
          <vstack 
            width="100%" 
            padding="large" 
            backgroundColor="#f1f5f9" 
            cornerRadius="medium"
            alignment="center middle"
          >
            <text size="medium" color="#64748b">
              No rankings yet. Be the first!
            </text>
          </vstack>
        ) : (
          entries.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isTopThree = entry.rank <= 3;
            
            return (
              <vstack
                key={entry.userId}
                width="100%"
                backgroundColor={isCurrentUser ? '#dbeafe' : isTopThree ? '#fef3c7' : '#ffffff'}
                cornerRadius="medium"
                padding="medium"
                border="thin"
                borderColor={isCurrentUser ? '#3b82f6' : isTopThree ? '#f59e0b' : '#e2e8f0'}
              >
                <hstack width="100%" alignment="space-between middle">
                  {/* Rank & Username */}
                  <hstack gap="medium" alignment="center middle" grow>
                    <text 
                      size="large" 
                      weight="bold"
                      color={isTopThree ? '#f59e0b' : '#64748b'}
                      minWidth="40px"
                    >
                      {getRankEmoji(entry.rank)}
                    </text>
                    
                    <vstack grow>
                      <text size="medium" weight="bold" color="#1e293b">
                        {entry.username}
                        {isCurrentUser && ' (You)'}
                      </text>
                      
                      {/* Additional metadata for diverse skillers */}
                      {category === LeaderboardCategory.DIVERSE_SKILLERS && 
                       entry.metadata?.uniqueCategories && (
                        <text size="small" color="#64748b">
                          {entry.metadata.uniqueCategories.slice(0, 3).join(', ')}
                          {entry.metadata.uniqueCategories.length > 3 && '...'}
                        </text>
                      )}
                    </vstack>
                  </hstack>

                  {/* Score */}
                  <vstack alignment="end middle">
                    <text size="medium" weight="bold" color="#10b981">
                      {formatScore(entry)}
                    </text>
                  </vstack>
                </hstack>
              </vstack>
            );
          })
        )}
      </vstack>

      {/* Footer - User's position if not in top 10 */}
      {currentUserId && !entries.some(e => e.userId === currentUserId) && (
        <vstack 
          width="100%" 
          padding="medium" 
          backgroundColor="#f8fafc" 
          cornerRadius="medium"
          alignment="center middle"
        >
          <text size="small" color="#64748b">
            You're not ranked yet. Keep helping to make the leaderboard!
          </text>
        </vstack>
      )}
    </vstack>
  );
}
