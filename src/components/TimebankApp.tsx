/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit, useState } from '@devvit/public-api';
import { SplashScreen } from './SplashScreen.js';
import { BrowseGigs } from './BrowseGigs.js';
import { MyGigs } from './MyGigs.js';
import { PostGig } from './PostGig.js';
import { TabNavigation } from './TabNavigation.js';
import { useTimebankState, saveState, loadState } from '../state/timebank.js';
import { UserService } from '../services/userService.js';

export type TabType = 'splash' | 'browse' | 'my-gigs' | 'post-gig';

interface TimebankAppProps {
  context: any;
}

export function TimebankApp({ context }: TimebankAppProps) {
  const [state, setState] = useTimebankState();
  const [currentTab, setCurrentTab] = useState<TabType>('splash');
  const [hasEntered, setHasEntered] = useState(false);
  // Start with not-initializing so users can press Enter; we only show
  // the loading state while we actually run the init flow after pressing.
  const [isInitializing, setIsInitializing] = useState(false);

  const handleEnterTimebank = async () => {
    setIsInitializing(true);
    
    try {
      const result = await UserService.ensureUserRegistered(state, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        
        // Show welcome message for new users
        if (result.newState.users[result.userId!]?.timeCredits === UserService.SIGNUP_BONUS_AMOUNT) {
          context.ui.showToast({ 
            text: `Welcome to TimeBank! You've received ${UserService.SIGNUP_BONUS_AMOUNT} time credit to get started!` 
          });
        }
      }
      
  setHasEntered(true);
  // Land users on Post Gig first to encourage posting
  setCurrentTab('post-gig');
    } catch (error) {
      context.ui.showToast({ text: 'Error initializing user' });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTabChange = async (tab: TabType) => {
    // Hydrate from Redis whenever switching tabs to ensure fresh data
    const latest = await loadState(context);
    setState(latest);
    setCurrentTab(tab);
  };

  const handlePostedSuccess = async () => {
    const latest = await loadState(context);
    setState(latest);
    setCurrentTab('my-gigs');
  };

  if (!hasEntered && currentTab === 'splash') {
    return <SplashScreen onEnter={handleEnterTimebank} isLoading={isInitializing} />;
  }

  return (
    <vstack height="100%" width="100%" backgroundColor="#f8fafc">
      <TabNavigation 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
      />
      
      <vstack height="100%" width="100%" padding="medium">
        {currentTab === 'browse' && <BrowseGigs context={context} />}
        {currentTab === 'my-gigs' && <MyGigs context={context} />}
        {currentTab === 'post-gig' && (
          <PostGig 
            context={context}
            onPostedSuccess={handlePostedSuccess}
          />
        )}
      </vstack>
    </vstack>
  );
}