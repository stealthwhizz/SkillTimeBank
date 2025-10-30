/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { TimebankApp } from './components/TimebankApp.js';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a menu action for creating posts - SUBREDDIT LEVEL
Devvit.addMenuItem({
  label: 'Create SkillTimeBank Post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    await reddit.submitPost({
      title: 'SkillTimeBank — Weekly Skill Swap Sprint',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" weight="bold">SkillTimeBank</text>
          <text>Click to start exchanging time and skills!</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'SkillTimeBank post created!' });
  },
});

// Add a menu action for creating posts - POST LEVEL (for testing)
Devvit.addMenuItem({
  label: 'Test: Create SkillTimeBank Post',
  location: 'post',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    await reddit.submitPost({
      title: 'SkillTimeBank — Weekly Skill Swap Sprint',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" weight="bold">SkillTimeBank</text>
          <text>Click to start exchanging time and skills!</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'SkillTimeBank post created!' });
  },
});

// Add the main post type
Devvit.addCustomPostType({
  name: 'SkillTimeBank',
  height: 'tall',
  render: (context) => {
    return <TimebankApp context={context} />;
  },
});

export default Devvit;