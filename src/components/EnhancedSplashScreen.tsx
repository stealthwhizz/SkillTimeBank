/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';

interface EnhancedSplashScreenProps {
  onAction: (action: 'post-request' | 'offer-skill' | 'browse') => void;
  userBalance?: number;
  isLoading?: boolean;
}

export function EnhancedSplashScreen({ 
  onAction, 
  userBalance = 1,
  isLoading = false 
}: EnhancedSplashScreenProps) {
  
  if (isLoading) {
    return (
      <vstack 
        height="100%" 
        width="100%" 
        alignment="middle center" 
        gap="large"
        backgroundColor="#0f172a"
        padding="large"
      >
        {/* Skeleton Loading State */}
        <vstack alignment="center middle" gap="medium" width="100%">
          <vstack 
            width="300px" 
            height="40px" 
            backgroundColor="#1e293b" 
            cornerRadius="medium"
          />
          <vstack 
            width="400px" 
            height="24px" 
            backgroundColor="#1e293b" 
            cornerRadius="medium"
          />
        </vstack>
        
        <vstack gap="small" width="100%" alignment="center middle">
          <vstack 
            width="280px" 
            height="48px" 
            backgroundColor="#1e293b" 
            cornerRadius="medium"
          />
          <vstack 
            width="280px" 
            height="48px" 
            backgroundColor="#1e293b" 
            cornerRadius="medium"
          />
          <vstack 
            width="280px" 
            height="48px" 
            backgroundColor="#1e293b" 
            cornerRadius="medium"
          />
        </vstack>
      </vstack>
    );
  }

  return (
    <vstack 
      height="100%" 
      width="100%" 
      alignment="middle center" 
      gap="large"
      backgroundColor="#0f172a"
      padding="large"
    >
      {/* Header Section with Branding */}
      <vstack alignment="center middle" gap="medium" maxWidth="600px">
        {/* App Icon/Logo */}
        <text size="xxlarge">⏰</text>
        
        <text size="xxlarge" weight="bold" color="#f1f5f9">
          Community TimeBank
        </text>
        
        <text size="large" color="#94a3b8" alignment="center">
          Trade skills with TimeCredits — 1 TC = 1 hour
        </text>
        
        {/* Quick Onboarding - 3 Steps */}
        <vstack gap="small" width="100%" padding="medium">
          <hstack gap="small" alignment="start middle">
            <text size="large" color="#10b981">✓</text>
            <text size="medium" color="#cbd5e1">
              You start with {userBalance} free TC to get started
            </text>
          </hstack>
          
          <hstack gap="small" alignment="start middle">
            <text size="large" color="#3b82f6">→</text>
            <text size="medium" color="#cbd5e1">
              Post what you need or offer what you can do
            </text>
          </hstack>
          
          <hstack gap="small" alignment="start middle">
            <text size="large" color="#f59e0b">★</text>
            <text size="medium" color="#cbd5e1">
              Complete gigs to earn credits & build reputation
            </text>
          </hstack>
        </vstack>
      </vstack>

      {/* Primary CTAs - Three Clear Actions */}
      <vstack gap="medium" width="100%" maxWidth="400px" alignment="center middle">
        <text size="medium" weight="bold" color="#e2e8f0">
          Choose your path:
        </text>
        
        <button 
          appearance="primary" 
          size="large"
          onPress={() => onAction('post-request')}
          grow
          width="100%"
        >
          🙋 Post a Request
        </button>
        
        <button 
          appearance="primary"
          size="large"
          onPress={() => onAction('offer-skill')}
          grow
          width="100%"
        >
          💪 Offer a Skill
        </button>
        
        <button 
          appearance="secondary"
          size="large"
          onPress={() => onAction('browse')}
          grow
          width="100%"
        >
          🔍 Browse All Gigs
        </button>
      </vstack>

      {/* Footer - Community Info */}
      <vstack alignment="center middle" gap="small">
        <text size="small" color="#64748b">
          A Reddit community for skill exchange
        </text>
        <hstack gap="small">
          <text size="small" color="#64748b">
            Safe • Fair • Collaborative
          </text>
        </hstack>
      </vstack>
    </vstack>
  );
}
