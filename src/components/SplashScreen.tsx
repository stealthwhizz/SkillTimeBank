/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';

interface SplashScreenProps {
  onEnter: () => void;
  isLoading?: boolean;
}

export function SplashScreen({ onEnter, isLoading = false }: SplashScreenProps) {
  return (
    <vstack 
      height="100%" 
      width="100%" 
      alignment="middle center" 
      gap="large"
      backgroundColor="#1e293b"
      padding="large"
    >
      {/* Hero Section */}
      <vstack alignment="center middle" gap="medium">
        <text size="xxlarge" weight="bold" color="#f1f5f9">
          🕐 TimeBank
        </text>
        <text size="large" color="#cbd5e1" alignment="center">
          Community Time Exchange
        </text>
      </vstack>

      {/* Description */}
      <vstack alignment="center middle" gap="small" maxWidth="300px">
        <text size="medium" color="#94a3b8" alignment="center">
          Trade skills and time with your community. No money required - just time and talent.
        </text>
      </vstack>

      {/* Features */}
      <vstack gap="small" alignment="start">
        <hstack gap="small" alignment="center middle">
          <text color="#10b981">✓</text>
          <text size="small" color="#e2e8f0">Post gigs and earn time credits</text>
        </hstack>
        <hstack gap="small" alignment="center middle">
          <text color="#10b981">✓</text>
          <text size="small" color="#e2e8f0">Browse available opportunities</text>
        </hstack>
        <hstack gap="small" alignment="center middle">
          <text color="#10b981">✓</text>
          <text size="small" color="#e2e8f0">Build community connections</text>
        </hstack>
      </vstack>

      {/* CTA Button */}
      <button 
        appearance="primary" 
        size="large"
        onPress={onEnter}
        disabled={isLoading}
      >
        {isLoading ? 'Initializing...' : 'Enter TimeBank'}
      </button>

      <text size="small" color="#64748b" alignment="center">
        Join the time-based economy
      </text>
    </vstack>
  );
}