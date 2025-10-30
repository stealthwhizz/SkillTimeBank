/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit, useState } from '@devvit/public-api';
import { GigCategory, GigType } from '../types/gig.js';
import { useTimebankState, saveState } from '../state/timebank.js';
import { GigService } from '../services/gigService.js';
import { UserService } from '../services/userService.js';

interface PostGigProps {
  context: any;
  onPostedSuccess?: (gigId: string) => void;
}

export function PostGig({ context, onPostedSuccess }: PostGigProps) {
  const [state, setState] = useTimebankState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GigCategory>(GigCategory.OTHER);
  const [gigType, setGigType] = useState<GigType>(GigType.FIND_HELP);
  const [timeCredits, setTimeCredits] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick-pick options for titles and descriptions (filtered by category)
  const titleOptionsByCategory: Record<GigCategory, string[]> = {
    [GigCategory.TECH]: ['Debug Python script', 'Set up a laptop', 'Fix Wi‑Fi issues'],
    [GigCategory.CREATIVE]: ['Logo feedback', 'Photo editing help', 'UX review for site'],
    [GigCategory.EDUCATION]: ['Math tutoring session', 'Resume review', 'Interview prep'],
    [GigCategory.HOUSEHOLD]: ['Assemble furniture', 'Garden help', 'Meal prep tips'],
    [GigCategory.TRANSPORTATION]: ['Grocery pickup', 'Airport ride coordination', 'Bike repair advice'],
    [GigCategory.CARE]: ['Pet sitting advice', 'Elder tech setup', 'Homework help'],
    [GigCategory.OTHER]: ['General advice session', 'Accountability partner', 'Brainstorm together'],
  };

  const descriptionOptionsByCategory: Record<GigCategory, string[]> = {
    [GigCategory.TECH]: [
      'Need help debugging a small script; share screen over Zoom.',
      'Set up basic software and updates on a new laptop.',
      'Troubleshoot slow home Wi‑Fi and optimize settings.'
    ],
    [GigCategory.CREATIVE]: [
      'Looking for constructive logo critique and improvement ideas.',
      'Edit a few photos for color and lighting; tips appreciated.',
      'Quick UX pass on a portfolio site—navigation and clarity.'
    ],
    [GigCategory.EDUCATION]: [
      'One-hour algebra study session with practice problems.',
      'Review resume wording and formatting; actionable feedback.',
      'Mock interview with feedback on answers and delivery.'
    ],
    [GigCategory.HOUSEHOLD]: [
      'Help assembling a flat‑pack shelf; bring basic tools if local.',
      'Advice on plant care and seasonal garden tasks.',
      'Share simple, healthy meal prep ideas for the week.'
    ],
    [GigCategory.TRANSPORTATION]: [
      'Pick up groceries and drop off at my place.',
      'Coordinate an early morning airport drop‑off.',
      'Basic tips to diagnose a squeaky bike brake.'
    ],
    [GigCategory.CARE]: [
      'Discuss a safe routine for pet sitting while I travel.',
      'Help set up a phone/tablet for an elderly relative.',
      'Support with planning a homework routine.'
    ],
    [GigCategory.OTHER]: [
      'Open discussion to brainstorm solutions to a problem.',
      'Weekly accountability check‑ins to stay on track.',
      'Coffee‑chat to bounce ideas and next steps.'
    ],
  };

  const categories = [
    { value: GigCategory.TECH, label: 'Technology' },
    { value: GigCategory.CREATIVE, label: 'Creative' },
    { value: GigCategory.EDUCATION, label: 'Education' },
    { value: GigCategory.HOUSEHOLD, label: 'Household' },
    { value: GigCategory.TRANSPORTATION, label: 'Transportation' },
    { value: GigCategory.CARE, label: 'Care' },
    { value: GigCategory.OTHER, label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
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

      const gigData = {
        title: title.trim(),
        description: description.trim(),
        category,
        type: gigType,
        timeCreditsOffered: parseInt(timeCredits),
        estimatedDuration: parseInt(duration),
        requiredSkills: [],
        // All gigs are remote for now
        isRemote: true,
        createdBy: userId
      };

      const result = GigService.createGig(currentState, gigData, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        
        // Reset form
        setTitle('');
        setDescription('');
        setTimeCredits('');
  setDuration('');
        
        context.ui.showToast({ text: 'Gig posted successfully!' });
        if (onPostedSuccess && result.gigId) {
          onPostedSuccess(result.gigId);
        }
      } else {
        context.ui.showToast({ text: result.error || 'Failed to post gig' });
      }
    } catch (error) {
      context.ui.showToast({ text: 'Error posting gig' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <vstack width="100%" gap="medium">
      {/* Header with top Post button */}
      <hstack width="100%" alignment="center">
        <vstack gap="small" grow>
          <text size="large" weight="bold" color="#1e293b">
            Post a New Gig
          </text>
          <text size="medium" color="#64748b">
            Share a task and offer time credits
          </text>
        </vstack>
        <button
          appearance="primary"
          size="medium"
          onPress={handleSubmit}
          disabled={!title || !description || !timeCredits || !duration || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Gig'}
        </button>
      </hstack>

      {/* Form */}
      <vstack 
        backgroundColor="#ffffff"
        cornerRadius="medium"
        padding="medium"
        gap="medium"
        border="thin"
        borderColor="#e2e8f0"
      >
        {/* Title (quick-pick options) */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Gig Title *
          </text>
          <hstack gap="small">
            {titleOptionsByCategory[category].map((opt) => (
              <button
                key={opt}
                appearance={title === opt ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setTitle(opt)}
              >
                {opt}
              </button>
            ))}
          </hstack>
          {title && (
            <text size="xsmall" color="#64748b">Selected: {title}</text>
          )}
        </vstack>

        {/* Description (quick-pick options) */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Description *
          </text>
          <hstack gap="small">
            {descriptionOptionsByCategory[category].map((opt) => (
              <button
                key={opt}
                appearance={description === opt ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setDescription(opt)}
              >
                {opt}
              </button>
            ))}
          </hstack>
          {description && (
            <text size="xsmall" color="#64748b">Selected: {description}</text>
          )}
        </vstack>

        {/* Gig Type */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Gig Type *
          </text>
          <hstack gap="small">
            <button
              appearance={gigType === GigType.FIND_HELP ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setGigType(GigType.FIND_HELP)}
            >
              🔍 Find Help (I pay)
            </button>
            <button
              appearance={gigType === GigType.OFFER_HELP ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setGigType(GigType.OFFER_HELP)}
            >
              🤝 Offer Help (They pay)
            </button>
          </hstack>
        </vstack>

        {/* Category */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Category *
          </text>
          <hstack gap="small" >
            {categories.map((cat) => (
              <button
                key={cat.value}
                appearance={category === cat.value ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </hstack>
        </vstack>

        {/* Time Credits and Duration (quick-pick chips) */}
        <hstack gap="medium" width="100%">
          <vstack gap="small" grow>
            <text size="small" weight="bold" color="#374151">
              Time Credits *
            </text>
            <hstack gap="small">
              {[1,2,3,5].map((tc) => (
                <button
                  key={`tc-${tc}`}
                  appearance={parseInt(timeCredits || '0') === tc ? 'primary' : 'secondary'}
                  size="small"
                  onPress={() => setTimeCredits(String(tc))}
                >
                  {tc} TC
                </button>
              ))}
            </hstack>
          </vstack>
          
          <vstack gap="small" grow>
            <text size="small" weight="bold" color="#374151">
              Duration (minutes) *
            </text>
            <hstack gap="small">
              {[30,60,90,120].map((mins) => (
                <button
                  key={`dur-${mins}`}
                  appearance={parseInt(duration || '0') === mins ? 'primary' : 'secondary'}
                  size="small"
                  onPress={() => setDuration(String(mins))}
                >
                  {mins}m
                </button>
              ))}
            </hstack>
          </vstack>
        </hstack>

        {/* Remote Option removed: all gigs are remote by default */}

        {/* Submit Button moved to top header */}
      </vstack>

      {/* Tips */}
      <vstack 
        backgroundColor="#f8fafc"
        cornerRadius="medium"
        padding="medium"
        gap="small"
      >
        <text size="small" weight="bold" color="#374151">
          💡 Tips for a great gig post:
        </text>
        <text size="xsmall" color="#64748b">
          • Be specific about what you need
        </text>
        <text size="xsmall" color="#64748b">
          • Set fair time credits based on complexity
        </text>
        <text size="xsmall" color="#64748b">
          • Include any required skills or tools
        </text>
      </vstack>
    </vstack>
  );
}
