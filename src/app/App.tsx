/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { Gig, GigStatus, GigType, GigCategory } from '../types/gig.js';
import { StatusChip } from '../components/StatusChip.js';

type TabType = 'splash' | 'browse' | 'my-gigs' | 'post-gig';

// Placeholder data
const placeholderGigs: Gig[] = [
  {
    id: '1',
    title: 'Resume review',
    description: 'Professional resume review and feedback',
    category: GigCategory.EDUCATION,
    type: GigType.FIND_HELP,
    timeCreditsOffered: 1,
    estimatedDuration: 60,
    requiredSkills: ['HR', 'Career coaching'],
    isRemote: true,
    createdBy: 'career_coach',
    createdAt: new Date(),
    status: GigStatus.OPEN
  },
  {
    id: '2', 
    title: 'Debug Python script',
    description: 'Help debug Python script issues with data processing',
    category: GigCategory.TECH,
    type: GigType.FIND_HELP,
    timeCreditsOffered: 1,
    estimatedDuration: 45,
    requiredSkills: ['Python', 'Debugging'],
    isRemote: true,
    createdBy: 'dev_helper',
    createdAt: new Date(),
    status: GigStatus.IN_PROGRESS
  },
  {
    id: '3',
    title: 'Website UX feedback',
    description: 'Need UX feedback on my portfolio site design',
    category: GigCategory.CREATIVE,
    type: GigType.FIND_HELP,
    timeCreditsOffered: 2,
    estimatedDuration: 90,
    requiredSkills: ['UX Design', 'Web Design'],
    isRemote: true,
    createdBy: 'designer_pro',
    createdAt: new Date(),
    status: GigStatus.COMPLETED
  }
];

const SplashScreen = ({ onEnter }: { onEnter: () => void }) => (
  <vstack 
    height="100%" 
    width="100%" 
    alignment="middle center" 
    gap="large"
    backgroundColor="#1e293b"
    padding="large"
  >
    <vstack alignment="center middle" gap="medium">
      <text size="xxlarge" weight="bold" color="#f1f5f9">
        Community TimeBank
      </text>
      <text size="large" color="#cbd5e1" alignment="center">
        Trade skills with TimeCredits — 1 TC = 1 hour.
      </text>
    </vstack>

    <button 
      appearance="primary" 
      size="large"
      onPress={onEnter}
    >
      Enter TimeBank
    </button>
  </vstack>
);

const BrowseTab = () => (
  <vstack width="100%" gap="medium">
    <text size="large" weight="bold" color="#1e293b">
      Browse Gigs
    </text>
    
    {placeholderGigs.map((gig) => (
      <vstack
        key={gig.id}
        backgroundColor="#ffffff"
        cornerRadius="medium"
        padding="medium"
        gap="small"
        border="thin"
        borderColor="#e2e8f0"
      >
        <hstack width="100%" alignment="start">
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
          <vstack grow>
            <hstack gap="small" alignment="center">
              <text size="small" color="#10b981" weight="bold">
                {gig.timeCreditsOffered} TC
              </text>
              <text size="small" color="#64748b">
                • {gig.estimatedDuration}min
              </text>
              <text size="small" color="#64748b">
                • {gig.isRemote ? '🌐 Remote' : '📍 Local'}
              </text>
            </hstack>
          </vstack>
          <button 
            appearance="secondary" 
            size="small"
            disabled={gig.status !== GigStatus.OPEN}
          >
            {gig.status === GigStatus.OPEN ? 'Accept' : 'Unavailable'}
          </button>
        </hstack>
      </vstack>
    ))}
  </vstack>
);

const MyGigsTab = () => (
  <vstack width="100%" gap="medium">
    <text size="large" weight="bold" color="#1e293b">
      My Gigs
    </text>
    
    <vstack gap="medium">
      <vstack gap="small">
        <text size="medium" weight="bold" color="#374151">
          Posted
        </text>
        <text size="small" color="#6b7280">
          No posted gigs yet
        </text>
      </vstack>
      
      <vstack gap="small">
        <text size="medium" weight="bold" color="#374151">
          Accepted
        </text>
        <text size="small" color="#6b7280">
          No accepted gigs yet
        </text>
      </vstack>
    </vstack>
  </vstack>
);

const PostGigTab = () => (
  <vstack width="100%" gap="medium">
    <text size="large" weight="bold" color="#1e293b">
      Post Gig
    </text>
    
    <vstack gap="medium">
      <vstack gap="small">
        <text size="small" weight="bold" color="#374151">
          Title
        </text>
        <text size="small" color="#6b7280">
          [Form field placeholder]
        </text>
      </vstack>
      
      <vstack gap="small">
        <text size="small" weight="bold" color="#374151">
          Description
        </text>
        <text size="small" color="#6b7280">
          [Form field placeholder]
        </text>
      </vstack>
      
      <vstack gap="small">
        <text size="small" weight="bold" color="#374151">
          Time Credits (TC)
        </text>
        <text size="small" color="#6b7280">
          [Number input placeholder]
        </text>
      </vstack>
      
      <button 
        appearance="primary" 
        size="medium"
        disabled={true}
      >
        Submit
      </button>
    </vstack>
  </vstack>
);

interface AppProps {
  initialTab?: TabType;
}

export function App({ initialTab = 'splash' }: AppProps = {}) {
  // For now, we'll create a simple stateless version that shows the browse tab
  // In a real implementation, this would use Devvit's state management
  const currentTab: TabType = 'browse';

  return (
    <vstack 
      height="100%" 
      width="100%" 
      backgroundColor="#f8fafc" 
      maxWidth="720px" 
      alignment="center top"
    >
      {/* Tab Navigation */}
      <hstack 
        width="100%" 
        backgroundColor="#ffffff" 
        padding="medium" 
        gap="small" 
        border="thin" 
        borderColor="#e2e8f0"
      >
        {(['browse', 'my-gigs', 'post-gig'] as const).map((tab) => (
          <button
            key={tab}
            appearance={currentTab === tab ? 'primary' : 'secondary'}
            size="small"
            onPress={() => {
              // Tab switching would be implemented with proper state management
            }}
          >
            {tab === 'browse' ? 'Browse' : tab === 'my-gigs' ? 'My Gigs' : 'Post Gig'}
          </button>
        ))}
      </hstack>
      
      {/* Tab Content */}
      <vstack height="100%" width="100%" padding="medium" gap="medium">
        <BrowseTab />
      </vstack>
    </vstack>
  );
}