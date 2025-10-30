/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { TabType } from './TimebankApp.js';

interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  // Put Post Gig first so it's most prominent
  const tabs = [
    { id: 'post-gig' as TabType, label: 'Post Gig', icon: '➕' },
    { id: 'browse' as TabType, label: 'Browse', icon: '🌐' },
    { id: 'my-gigs' as TabType, label: 'My Gigs', icon: '📋' },
  ];

  return (
    <hstack 
      width="100%" 
      backgroundColor="#ffffff" 
      padding="small"
      gap="small"
      alignment="center middle"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          appearance={currentTab === tab.id ? 'primary' : 'secondary'}
          size="small"
          onPress={() => onTabChange(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </hstack>
  );
}