import { describe, it, expect, beforeEach } from 'vitest';
import { GigService } from '../src/services/gigService';
import { TimebankState } from '../src/state/timebank';
import { User } from '../src/types/user';
import { GigStatus, GigCategory, GigType } from '../src/types/gig';
import { TransactionStatus, TransactionType } from '../src/types/transaction';

describe('Full Lifecycle Integration Tests', () => {
  let initialState: TimebankState;
  let gigCreator: User;
  let gigWorker: User;
  let mockContext: any;

  beforeEach(() => {
    gigCreator = {
      id: 'creator',
      username: 'creator',
      timeCredits: 100,
      reputation: 5,
      skills: ['management'],
      joinedAt: new Date(),
      isActive: true
    };

    gigWorker = {
      id: 'worker',
      username: 'worker',
      timeCredits: 20,
      reputation: 4,
      skills: ['programming', 'design'],
      joinedAt: new Date(),
      isActive: true
    };

    initialState = {
      users: {
        [gigCreator.id]: gigCreator,
        [gigWorker.id]: gigWorker
      },
      gigs: {},
      transactions: {},
      currentUser: gigCreator.id
    };

    mockContext = {
      reddit: {
        getCurrentUser: () => Promise.resolve({ id: gigCreator.id, username: gigCreator.username })
      },
      redis: {
        set: () => Promise.resolve(),
        get: () => Promise.resolve(null)
      }
    };
  });

  it('should complete full gig lifecycle: OPEN→ASSIGNED→IN_PROGRESS→COMPLETED with transaction', () => {
    // Snapshot initial state
    expect(Object.keys(initialState.gigs)).toHaveLength(0);
    expect(Object.keys(initialState.transactions)).toHaveLength(0);
    expect(initialState.users[gigCreator.id]?.timeCredits).toBe(100);
    expect(initialState.users[gigWorker.id]?.timeCredits).toBe(20);

    // 1. Create gig (OPEN status)
    const gigData = {
      title: 'Build mobile app',
      description: 'Create a React Native app',
      category: GigCategory.TECH,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 50,
      estimatedDuration: 240,
      requiredSkills: ['programming'],
      isRemote: true,
      createdBy: gigCreator.id
    };

    const createResult = GigService.createGig(initialState, gigData, mockContext);
    expect(createResult.success).toBe(true);
    expect(createResult.gigId).toBeDefined();
    
    let currentState = createResult.newState!;
    let gigId = createResult.gigId!;
    
    // Verify OPEN state
    let currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.OPEN);
    expect(currentGig?.assignedTo).toBeUndefined();

    // 2. Accept gig (OPEN → ASSIGNED)
    const acceptResult = GigService.acceptGig(currentState, gigId, gigWorker.id, mockContext);
    expect(acceptResult.success).toBe(true);
    
    currentState = acceptResult.newState!;
    
    // Verify ASSIGNED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.ASSIGNED);
    expect(currentGig?.assignedTo).toBe(gigWorker.id);

    // 3. Start gig (ASSIGNED → IN_PROGRESS)
    const startResult = GigService.startGig(currentState, gigId, gigWorker.id, mockContext);
    expect(startResult.success).toBe(true);
    
    currentState = startResult.newState!;
    
    // Verify IN_PROGRESS state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.IN_PROGRESS);

    // 4. Complete gig (IN_PROGRESS → COMPLETED + create transaction)
    const completeResult = GigService.confirmGigCompletion(currentState, gigId, gigCreator.id, mockContext);
    expect(completeResult.success).toBe(true);
    expect(completeResult.transactionId).toBeDefined();
    
    currentState = completeResult.newState!;
    
    // Verify COMPLETED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.COMPLETED);
    expect(currentGig?.completedAt).toBeDefined();

    // Verify transaction was created and processed
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    
    const transactions = Object.values(currentState.transactions);
    const transaction = transactions[0];
    
    expect(transaction.fromUserId).toBe(gigCreator.id);
    expect(transaction.toUserId).toBe(gigWorker.id);
    expect(transaction.gigId).toBe(gigId);
    expect(transaction.amount).toBe(50);
    expect(transaction.type).toBe(TransactionType.GIG_PAYMENT);
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
    expect(transaction.completedAt).toBeDefined();
    
    // Credits should be transferred
    expect(currentState.users[gigCreator.id]?.timeCredits).toBe(50); // 100 - 50
    expect(currentState.users[gigWorker.id]?.timeCredits).toBe(70);  // 20 + 50

    // Snapshot final state comparison
    expect(Object.keys(currentState.gigs)).toHaveLength(1);
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    expect(Object.keys(currentState.users)).toHaveLength(2);
  });

  it('should handle lifecycle with insufficient funds', () => {
    // Create user with insufficient credits
    const poorCreator: User = {
      id: 'poor-creator',
      username: 'poor-creator',
      timeCredits: 10, // Less than gig payment
      reputation: 2,
      skills: [],
      joinedAt: new Date(),
      isActive: true
    };

    const stateWithPoorUser = {
      ...initialState,
      users: { ...initialState.users, [poorCreator.id]: poorCreator }
    };

    const expensiveGigData = {
      title: 'Expensive task',
      description: 'This costs more than creator has',
      category: GigCategory.OTHER,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 30, // More than creator's 10 credits
      estimatedDuration: 60,
      requiredSkills: [],
      isRemote: true,
      createdBy: poorCreator.id
    };

    // Creation should fail due to insufficient funds for FIND_HELP gig
    const createResult = GigService.createGig(stateWithPoorUser, expensiveGigData, mockContext);
    expect(createResult.success).toBe(false);
    expect(createResult.error).toContain('Insufficient time credits');

  });

  it('should handle dual confirmation workflow', () => {
    const gigData = {
      title: 'Dual confirmation task',
      description: 'This requires both parties to confirm',
      category: GigCategory.CREATIVE,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 25,
      estimatedDuration: 90,
      requiredSkills: ['design'],
      isRemote: false,
      createdBy: gigCreator.id
    };

    // Progress through lifecycle
    const createResult = GigService.createGig(initialState, gigData, mockContext);
    expect(createResult.success).toBe(true);
    
    let currentState = createResult.newState!;
    const gigId = createResult.gigId!;
    
    const acceptResult = GigService.acceptGig(currentState, gigId, gigWorker.id, mockContext);
    expect(acceptResult.success).toBe(true);
    
    currentState = acceptResult.newState!;
    
    // First confirmation from ASSIGNED should set to AWAITING_CONFIRMATION
    const firstConfirm = GigService.confirmGigCompletion(currentState, gigId, gigCreator.id, mockContext);
    expect(firstConfirm.success).toBe(true);
    
    currentState = firstConfirm.newState!;
    
    let currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.AWAITING_CONFIRMATION);
    
    // Second confirmation should complete and process payment
    const secondConfirm = GigService.confirmGigCompletion(currentState, gigId, gigWorker.id, mockContext);
    expect(secondConfirm.success).toBe(true);
    expect(secondConfirm.transactionId).toBeDefined();
    
    currentState = secondConfirm.newState!;
    
    // Verify completed state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.COMPLETED);
    expect(currentGig?.completedAt).toBeDefined();
    
    // Verify transaction created and processed
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    const transaction = Object.values(currentState.transactions)[0];
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
    
    // Verify user credits updated
    expect(currentState.users[gigCreator.id]?.timeCredits).toBe(75); // 100 - 25
    expect(currentState.users[gigWorker.id]?.timeCredits).toBe(45);  // 20 + 25
  });

  it('should handle OFFER_HELP gig payment direction', () => {
    const offerGigData = {
      title: 'I will help you',
      description: 'Offering my services',
      category: GigCategory.TECH,
      type: GigType.OFFER_HELP,
      timeCreditsOffered: 30,
      estimatedDuration: 120,
      requiredSkills: ['programming'],
      isRemote: true,
      createdBy: gigWorker.id // Worker is offering help
    };

    // Complete lifecycle
    const createResult = GigService.createGig(initialState, offerGigData, mockContext);
    expect(createResult.success).toBe(true);
    
    let currentState = createResult.newState!;
    const gigId = createResult.gigId!;
    
    const acceptResult = GigService.acceptGig(currentState, gigId, gigCreator.id, mockContext);
    expect(acceptResult.success).toBe(true);
    
    currentState = acceptResult.newState!;
    
    const startResult = GigService.startGig(currentState, gigId, gigCreator.id, mockContext);
    expect(startResult.success).toBe(true);
    
    currentState = startResult.newState!;
    
    const completeResult = GigService.confirmGigCompletion(currentState, gigId, gigWorker.id, mockContext);
    expect(completeResult.success).toBe(true);
    
    currentState = completeResult.newState!;
    
    // For OFFER_HELP, the accepter (gigCreator) pays the offerer (gigWorker)
    const transaction = Object.values(currentState.transactions)[0];
    expect(transaction.fromUserId).toBe(gigCreator.id); // Creator pays
    expect(transaction.toUserId).toBe(gigWorker.id);    // Worker receives
    
    // Verify credits transferred correctly
    expect(currentState.users[gigCreator.id]?.timeCredits).toBe(70); // 100 - 30
    expect(currentState.users[gigWorker.id]?.timeCredits).toBe(50);  // 20 + 30
  });

  it('should complete full lifecycle with IN_PROGRESS status: OPEN→ASSIGNED→IN_PROGRESS→AWAITING_CONFIRMATION→COMPLETED', () => {
    // Snapshot initial state
    expect(Object.keys(initialState.gigs)).toHaveLength(0);
    expect(Object.keys(initialState.transactions)).toHaveLength(0);
    expect(initialState.users[gigCreator.id]?.timeCredits).toBe(100);
    expect(initialState.users[gigWorker.id]?.timeCredits).toBe(20);

    const gigData = {
      title: 'Full lifecycle with IN_PROGRESS',
      description: 'Test complete state transitions',
      category: GigCategory.CREATIVE,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 40,
      estimatedDuration: 180,
      requiredSkills: ['design'],
      isRemote: false,
      createdBy: gigCreator.id
    };

    // 1. Create gig (OPEN status)
    const createResult = GigService.createGig(initialState, gigData, mockContext);
    expect(createResult.success).toBe(true);
    expect(createResult.gigId).toBeDefined();
    
    let currentState = createResult.newState!;
    let gigId = createResult.gigId!;
    
    // Verify OPEN state
    let currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.OPEN);
    expect(currentGig?.assignedTo).toBeUndefined();

    // 2. Accept gig (OPEN → ASSIGNED)
    const acceptResult = GigService.acceptGig(currentState, gigId, gigWorker.id, mockContext);
    expect(acceptResult.success).toBe(true);
    
    currentState = acceptResult.newState!;
    
    // Verify ASSIGNED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.ASSIGNED);
    expect(currentGig?.assignedTo).toBe(gigWorker.id);

    // 3. Start gig (ASSIGNED → IN_PROGRESS)
    const startResult = GigService.startGig(currentState, gigId, gigWorker.id, mockContext);
    expect(startResult.success).toBe(true);
    
    currentState = startResult.newState!;
    
    // Verify IN_PROGRESS state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.IN_PROGRESS);

    // 4. Confirmation from IN_PROGRESS (IN_PROGRESS → COMPLETED + create transaction)
    const confirmResult = GigService.confirmGigCompletion(currentState, gigId, gigCreator.id, mockContext);
    expect(confirmResult.success).toBe(true);
    expect(confirmResult.transactionId).toBeDefined(); // Transaction created immediately
    
    currentState = confirmResult.newState!;
    
    // Verify COMPLETED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.COMPLETED);
    expect(currentGig?.completedAt).toBeDefined();

    // Verify transaction was created and processed
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    
    const transactions = Object.values(currentState.transactions);
    const transaction = transactions[0];
    
    expect(transaction.fromUserId).toBe(gigCreator.id);
    expect(transaction.toUserId).toBe(gigWorker.id);
    expect(transaction.gigId).toBe(gigId);
    expect(transaction.amount).toBe(40);
    expect(transaction.type).toBe(TransactionType.GIG_PAYMENT);
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
    expect(transaction.completedAt).toBeDefined();
    
    // Credits should be transferred
    expect(currentState.users[gigCreator.id]?.timeCredits).toBe(60); // 100 - 40
    expect(currentState.users[gigWorker.id]?.timeCredits).toBe(60);  // 20 + 40

    // Snapshot final state comparison
    expect(Object.keys(currentState.gigs)).toHaveLength(1);
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    expect(Object.keys(currentState.users)).toHaveLength(2);
  });

  it('should complete lifecycle via AWAITING_CONFIRMATION: OPEN→ASSIGNED→AWAITING_CONFIRMATION→COMPLETED', () => {
    // Snapshot initial state
    expect(Object.keys(initialState.gigs)).toHaveLength(0);
    expect(Object.keys(initialState.transactions)).toHaveLength(0);
    expect(initialState.users[gigCreator.id]?.timeCredits).toBe(100);
    expect(initialState.users[gigWorker.id]?.timeCredits).toBe(20);

    const gigData = {
      title: 'AWAITING_CONFIRMATION lifecycle test',
      description: 'Test ASSIGNED → AWAITING_CONFIRMATION → COMPLETED',
      category: GigCategory.OTHER,
      type: GigType.FIND_HELP,
      timeCreditsOffered: 35,
      estimatedDuration: 90,
      requiredSkills: [],
      isRemote: true,
      createdBy: gigCreator.id
    };

    // 1. Create gig (OPEN status)
    const createResult = GigService.createGig(initialState, gigData, mockContext);
    expect(createResult.success).toBe(true);
    expect(createResult.gigId).toBeDefined();
    
    let currentState = createResult.newState!;
    let gigId = createResult.gigId!;
    
    // Verify OPEN state
    let currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.OPEN);

    // 2. Accept gig (OPEN → ASSIGNED)
    const acceptResult = GigService.acceptGig(currentState, gigId, gigWorker.id, mockContext);
    expect(acceptResult.success).toBe(true);
    
    currentState = acceptResult.newState!;
    
    // Verify ASSIGNED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.ASSIGNED);
    expect(currentGig?.assignedTo).toBe(gigWorker.id);

    // 3. First confirmation from ASSIGNED (ASSIGNED → AWAITING_CONFIRMATION)
    const firstConfirmResult = GigService.confirmGigCompletion(currentState, gigId, gigCreator.id, mockContext);
    expect(firstConfirmResult.success).toBe(true);
    expect(firstConfirmResult.transactionId).toBeUndefined(); // No transaction yet
    
    currentState = firstConfirmResult.newState!;
    
    // Verify AWAITING_CONFIRMATION state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.AWAITING_CONFIRMATION);
    expect(currentGig?.completedAt).toBeUndefined(); // Not completed yet

    // 4. Second confirmation (AWAITING_CONFIRMATION → COMPLETED + create transaction)
    const secondConfirmResult = GigService.confirmGigCompletion(currentState, gigId, gigWorker.id, mockContext);
    expect(secondConfirmResult.success).toBe(true);
    expect(secondConfirmResult.transactionId).toBeDefined();
    
    currentState = secondConfirmResult.newState!;
    
    // Verify COMPLETED state
    currentGig = currentState.gigs[gigId];
    expect(currentGig?.status).toBe(GigStatus.COMPLETED);
    expect(currentGig?.completedAt).toBeDefined();

    // Verify transaction was created and processed
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    
    const transactions = Object.values(currentState.transactions);
    const transaction = transactions[0];
    
    expect(transaction.fromUserId).toBe(gigCreator.id);
    expect(transaction.toUserId).toBe(gigWorker.id);
    expect(transaction.gigId).toBe(gigId);
    expect(transaction.amount).toBe(35);
    expect(transaction.type).toBe(TransactionType.GIG_PAYMENT);
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
    expect(transaction.completedAt).toBeDefined();
    
    // Credits should be transferred
    expect(currentState.users[gigCreator.id]?.timeCredits).toBe(65); // 100 - 35
    expect(currentState.users[gigWorker.id]?.timeCredits).toBe(55);  // 20 + 35

    // Snapshot final state comparison
    expect(Object.keys(currentState.gigs)).toHaveLength(1);
    expect(Object.keys(currentState.transactions)).toHaveLength(1);
    expect(Object.keys(currentState.users)).toHaveLength(2);
  });
});