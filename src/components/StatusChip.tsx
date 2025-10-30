/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { GigStatus } from '../types/gig.js';

interface StatusChipProps {
  status: GigStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const getStatusConfig = (status: GigStatus) => {
    switch (status) {
      case GigStatus.OPEN:
        return { 
          color: '#10b981', 
          backgroundColor: '#d1fae5', 
          label: 'OPEN' 
        };
      case GigStatus.IN_PROGRESS:
        return { 
          color: '#f59e0b', 
          backgroundColor: '#fef3c7', 
          label: 'IN PROGRESS' 
        };
      case GigStatus.ASSIGNED:
        return { 
          color: '#3b82f6', 
          backgroundColor: '#dbeafe', 
          label: 'ASSIGNED' 
        };
      case GigStatus.AWAITING_CONFIRMATION:
        return { 
          color: '#8b5cf6', 
          backgroundColor: '#ede9fe', 
          label: 'AWAITING CONFIRMATION' 
        };
      case GigStatus.COMPLETED:
        return { 
          color: '#6b7280', 
          backgroundColor: '#f3f4f6', 
          label: 'COMPLETED' 
        };
      case GigStatus.CANCELLED:
        return { 
          color: '#ef4444', 
          backgroundColor: '#fee2e2', 
          label: 'CANCELLED' 
        };
      default:
        return { 
          color: '#6b7280', 
          backgroundColor: '#f3f4f6', 
          label: 'UNKNOWN' 
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <hstack 
      backgroundColor={config.backgroundColor}
      cornerRadius="full"
      padding="xsmall"
      alignment="center middle"
    >
      <text 
        size="xsmall" 
        weight="bold" 
        color={config.color}
      >
        {config.label}
      </text>
    </hstack>
  );
}