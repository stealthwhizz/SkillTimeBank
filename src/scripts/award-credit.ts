#!/usr/bin/env node

/**
 * Admin Script: Award Credits
 * 
 * Awards time credits to a specific user and creates an admin transaction record.
 * 
 * Usage:
 *   npx tsx src/scripts/award-credit.ts --username <username> --amount <amount> --reason <reason>
 * 
 * Example:
 *   npx tsx src/scripts/award-credit.ts --username "john_doe" --amount 50 --reason "Community contribution bonus"
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { TimebankState } from '../state/timebank.js';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction.js';
import { User } from '../types/user.js';

interface AwardCreditArgs {
  username: string;
  amount: number;
  reason: string;
}

const SYSTEM_USER_ID = 'system';
const STATE_FILE_PATH = './timebank-state.json';

function parseArgs(): AwardCreditArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<AwardCreditArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--username':
        parsed.username = value;
        break;
      case '--amount':
        parsed.amount = parseInt(value, 10);
        break;
      case '--reason':
        parsed.reason = value;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        process.exit(1);
    }
  }

  if (!parsed.username || !parsed.amount || !parsed.reason) {
    console.error('Usage: award-credit.ts --username <username> --amount <amount> --reason <reason>');
    console.error('');
    console.error('Required parameters:');
    console.error('  --username  Target username to award credits to');
    console.error('  --amount    Number of time credits to award (positive integer)');
    console.error('  --reason    Reason for the credit award');
    process.exit(1);
  }

  if (isNaN(parsed.amount!) || parsed.amount! <= 0) {
    console.error('Error: Amount must be a positive integer');
    process.exit(1);
  }

  return parsed as AwardCreditArgs;
}

function loadState(): TimebankState {
  if (!existsSync(STATE_FILE_PATH)) {
    console.log('No existing state file found. Creating new state.');
    return {
      users: {},
      gigs: {},
      transactions: {},
      currentUser: undefined
    };
  }

  try {
    const stateData = readFileSync(STATE_FILE_PATH, 'utf-8');
    return JSON.parse(stateData);
  } catch (error) {
    console.error('Error loading state:', error);
    process.exit(1);
  }
}

function saveState(state: TimebankState): void {
  try {
    writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));
    console.log(`State saved to ${STATE_FILE_PATH}`);
  } catch (error) {
    console.error('Error saving state:', error);
    process.exit(1);
  }
}

function findUserByUsername(state: TimebankState, username: string): User | null {
  return Object.values(state.users).find(user => 
    user.username.toLowerCase() === username.toLowerCase()
  ) || null;
}

function ensureSystemUser(state: TimebankState): TimebankState {
  if (!state.users[SYSTEM_USER_ID]) {
    const systemUser: User = {
      id: SYSTEM_USER_ID,
      username: 'System',
      timeCredits: Number.MAX_SAFE_INTEGER,
      reputation: 0,
      skills: [],
      joinedAt: new Date(),
      isActive: true
    };

    return {
      ...state,
      users: {
        ...state.users,
        [SYSTEM_USER_ID]: systemUser
      }
    };
  }
  return state;
}

function awardCredit(state: TimebankState, args: AwardCreditArgs): TimebankState {
  // Find target user
  const targetUser = findUserByUsername(state, args.username);
  if (!targetUser) {
    console.error(`Error: User with username "${args.username}" not found`);
    console.error('Available users:');
    Object.values(state.users).forEach(user => {
      if (user.id !== SYSTEM_USER_ID) {
        console.error(`  - ${user.username} (${user.id})`);
      }
    });
    process.exit(1);
  }

  console.log(`Found user: ${targetUser.username} (${targetUser.id})`);
  console.log(`Current balance: ${targetUser.timeCredits} TC`);
  console.log(`Awarding: ${args.amount} TC`);
  console.log(`Reason: ${args.reason}`);

  // Confirm action
  console.log('\nThis action will:');
  console.log(`1. Add ${args.amount} time credits to ${targetUser.username}`);
  console.log(`2. Create an ADMIN_AWARD transaction record`);
  console.log(`3. Update the user's balance from ${targetUser.timeCredits} to ${targetUser.timeCredits + args.amount} TC`);

  // Create transaction
  const transactionId = `tx_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const transaction: Transaction = {
    id: transactionId,
    fromUserId: SYSTEM_USER_ID,
    toUserId: targetUser.id,
    gigId: '', // No associated gig
    amount: args.amount,
    type: TransactionType.ADMIN_AWARD,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(),
    completedAt: new Date(),
    description: `Admin credit award: ${args.reason}`
  };

  // Update user balance
  const updatedUser: User = {
    ...targetUser,
    timeCredits: targetUser.timeCredits + args.amount
  };

  // Ensure system user exists and update state
  let newState = ensureSystemUser(state);
  newState = {
    ...newState,
    users: {
      ...newState.users,
      [targetUser.id]: updatedUser
    },
    transactions: {
      ...newState.transactions,
      [transactionId]: transaction
    }
  };

  console.log(`\n✅ Successfully awarded ${args.amount} TC to ${targetUser.username}`);
  console.log(`New balance: ${updatedUser.timeCredits} TC`);
  console.log(`Transaction ID: ${transactionId}`);

  return newState;
}

function main() {
  console.log('🏦 TimeBank Admin: Award Credits\n');

  const args = parseArgs();
  
  console.log('Loading current state...');
  const state = loadState();
  
  console.log(`Found ${Object.keys(state.users).length} users and ${Object.keys(state.transactions).length} transactions\n`);

  const newState = awardCredit(state, args);
  
  console.log('\nSaving updated state...');
  saveState(newState);
  
  console.log('\n🎉 Credit award completed successfully!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}