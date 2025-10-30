/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { WeeklyEvent, EventStatus } from '../types/event.js';

interface WeeklyEventCardProps {
  event: WeeklyEvent;
  currentUserId?: string;
}

export function WeeklyEventCard({ event, currentUserId }: WeeklyEventCardProps) {
  const progressPercent = Math.min(100, (event.currentProgress / event.goalAmount) * 100);
  const isParticipant = currentUserId && event.participants.includes(currentUserId);
  
  const getEventIcon = (theme: string) => {
    const icons: Record<string, string> = {
      tech: '💻',
      creative: '🎨',
      education: '📚',
      care: '💚',
      mixed: '🌟'
    };
    return icons[theme] || '🌟';
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = new Date(endDate).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon!';
  };

  return (
    <vstack
      width="100%"
      backgroundColor={event.status === EventStatus.COMPLETED ? '#10b981' : '#1e3a8a'}
      cornerRadius="medium"
      padding="medium"
      gap="medium"
      border="thin"
      borderColor={event.status === EventStatus.COMPLETED ? '#34d399' : '#3b82f6'}
    >
      {/* Header */}
      <hstack width="100%" alignment="space-between middle">
        <hstack gap="small" alignment="center middle">
          <text size="large">{getEventIcon(event.theme)}</text>
          <text size="large" weight="bold" color="#f1f5f9">
            {event.title}
          </text>
        </hstack>
        
        {event.status === EventStatus.ACTIVE && (
          <vstack alignment="end middle">
            <text size="small" color="#cbd5e1">
              {formatTimeRemaining(event.endDate)}
            </text>
          </vstack>
        )}
      </hstack>

      {/* Description */}
      <text size="medium" color="#e2e8f0">
        {event.description}
      </text>

      {/* Progress Bar */}
      <vstack width="100%" gap="small">
        <hstack width="100%" alignment="space-between middle">
          <text size="small" color="#cbd5e1">
            Progress
          </text>
          <text size="small" weight="bold" color="#f1f5f9">
            {event.currentProgress} / {event.goalAmount} gigs
          </text>
        </hstack>
        
        {/* Progress bar container */}
        <vstack width="100%" height="8px" backgroundColor="#1e293b" cornerRadius="small">
          <vstack 
            width={`${progressPercent}%`} 
            height="8px" 
            backgroundColor={event.status === EventStatus.COMPLETED ? '#34d399' : '#3b82f6'}
            cornerRadius="small"
          />
        </vstack>
        
        <text size="small" color="#94a3b8">
          {progressPercent.toFixed(0)}% complete
        </text>
      </vstack>

      {/* Participants & Rewards */}
      <hstack width="100%" alignment="space-between middle">
        <vstack gap="none">
          <text size="small" color="#cbd5e1">
            {event.participants.length} participants
          </text>
          {isParticipant && (
            <text size="small" color="#10b981" weight="bold">
              ✓ You're participating!
            </text>
          )}
        </vstack>
        
        <vstack alignment="end middle" gap="none">
          <text size="small" color="#fbbf24" weight="bold">
            +{event.rewardPerParticipant} TC
          </text>
          <text size="small" color="#94a3b8">
            per participant
          </text>
        </vstack>
      </hstack>

      {/* Completion Message */}
      {event.status === EventStatus.COMPLETED && (
        <vstack 
          width="100%" 
          padding="small" 
          backgroundColor="#065f46" 
          cornerRadius="small"
          alignment="center middle"
        >
          <text size="medium" weight="bold" color="#d1fae5">
            🎉 Goal Achieved! Rewards distributed!
          </text>
        </vstack>
      )}
    </vstack>
  );
}
