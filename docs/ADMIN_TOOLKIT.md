# TimeBank Admin Toolkit

This document provides administrators with comprehensive tools and procedures for managing the TimeBank economy, user accounts, and moderation actions.

## Overview

The TimeBank admin toolkit includes command-line scripts for:
- **Credit Management**: Award credits to users for contributions
- **Economy Management**: Reset economy in emergency situations  
- **User Moderation**: Ban users and manage account status
- **Audit Trail**: Track all administrative actions

All scripts operate on the local state file (`timebank-state.json`) and include safety features like confirmation prompts and audit logging.

## Command Reference

### 1. Award Credits (`award-credit.ts`)

Awards time credits to users for community contributions, bug reports, or other valuable activities.

#### Usage
```bash
npx tsx src/scripts/award-credit.ts --username <username> --amount <amount> --reason <reason>
```

#### Parameters
- `--username` (required): Target username to award credits to
- `--amount` (required): Number of time credits to award (positive integer)
- `--reason` (required): Reason for the credit award (will be logged)

#### Examples
```bash
# Award credits for community contribution
npx tsx src/scripts/award-credit.ts --username "alice_dev" --amount 50 --reason "Excellent bug report with reproduction steps"

# Award credits for helping other users
npx tsx src/scripts/award-credit.ts --username "bob_helper" --amount 25 --reason "Helping new users in community chat"

# Award credits for content creation
npx tsx src/scripts/award-credit.ts --username "carol_writer" --amount 100 --reason "Created comprehensive tutorial for new users"
```

#### Safety Features
- Validates user exists before awarding
- Shows current balance and new balance preview
- Creates permanent audit trail with ADMIN_AWARD transaction
- Prevents negative amounts
- Case-insensitive username matching

#### Output
```
🏦 TimeBank Admin: Award Credits

Loading current state...
Found 15 users and 47 transactions

Found user: alice_dev (user_123)
Current balance: 75 TC
Awarding: 50 TC
Reason: Excellent bug report with reproduction steps

This action will:
1. Add 50 time credits to alice_dev
2. Create an ADMIN_AWARD transaction record
3. Update the user's balance from 75 to 125 TC

✅ Successfully awarded 50 TC to alice_dev
New balance: 125 TC
Transaction ID: tx_admin_1698765432_abc123

🎉 Credit award completed successfully!
```

---

### 2. Reset Economy (`reset-economy.ts`)

⚠️ **DANGER**: Completely resets the TimeBank economy. Use only in emergency situations.

#### Usage
```bash
npx tsx src/scripts/reset-economy.ts --confirm-reset --backup-file <backup-path>
```

#### Parameters
- `--confirm-reset` (required): Safety flag confirming you understand this resets everything
- `--backup-file` (required): Path where current state will be backed up before reset

#### Examples
```bash
# Reset economy with timestamped backup
npx tsx src/scripts/reset-economy.ts --confirm-reset --backup-file ./backups/pre-reset-$(date +%Y%m%d-%H%M%S).json

# Reset economy with descriptive backup name
npx tsx src/scripts/reset-economy.ts --confirm-reset --backup-file ./backups/before-economy-reset-emergency.json
```

#### What It Does
1. **Backup**: Creates complete backup of current state
2. **Reset User Balances**: All users reset to signup bonus amount (50 TC)
3. **Clear Gigs**: Removes all gig history (open, completed, etc.)
4. **Clear Transactions**: Removes all transaction history except new signup bonuses
5. **Preserve Users**: Keeps user accounts, profiles, and reputation intact
6. **Audit Trail**: Creates admin transaction record of the reset

#### Safety Requirements
- Must provide both required flags
- Interactive confirmation prompt with summary
- Automatic backup creation and verification
- Cannot be undone without backup restoration

#### Status
```
🚧 Currently under development for safety reasons
❌ Not implemented yet. Exiting safely.
```

---

### 3. Ban User (`ban-user.ts`)

⚠️ **MODERATION ACTION**: Bans users for policy violations and manages account deactivation.

#### Usage
```bash
npx tsx src/scripts/ban-user.ts --username <username> --reason <reason> [--freeze-credits]
```

#### Parameters
- `--username` (required): Username of the user to ban
- `--reason` (required): Clear reason for the ban (will be permanently logged)
- `--freeze-credits` (optional): Freeze user's time credits (default: false)

#### Examples
```bash
# Ban user for spam
npx tsx src/scripts/ban-user.ts --username "spammer123" --reason "Posting inappropriate gigs repeatedly" --freeze-credits

# Ban user for harassment
npx tsx src/scripts/ban-user.ts --username "toxic_user" --reason "Harassment of other community members"

# Temporary ban without freezing credits
npx tsx src/scripts/ban-user.ts --username "rule_violator" --reason "Minor community guideline violation - first offense"
```

#### What It Does
1. **Account Deactivation**: Marks user account as inactive/banned
2. **Gig Cancellation**: Cancels all open gigs posted by the user
3. **Payment Handling**: Processes refunds for any pending payments
4. **Credit Management**: Optionally freezes time credits
5. **Audit Trail**: Creates permanent ban record with reason
6. **Activity Summary**: Shows user's current gigs and transactions before ban

#### Safety Features
- Shows complete user activity summary before action
- Interactive confirmation with reason display
- Permanent audit trail creation
- Handles in-progress gigs gracefully
- Processes refunds automatically

#### Status
```
🚧 Currently under development for safety reasons
❌ Not implemented yet. Exiting safely.
```

---

## Safety Guidelines

### Pre-Execution Checklist
- [ ] **Backup State**: Always create backup before destructive operations
- [ ] **Verify Target**: Double-check usernames and amounts
- [ ] **Test Environment**: Test scripts in development environment first
- [ ] **Documentation**: Document reason for administrative action
- [ ] **Notification**: Inform affected users when appropriate

### Confirmation Prompts
All scripts include interactive confirmation prompts that show:
- Current state summary
- Exact changes to be made
- Affected users and amounts
- Irreversible action warnings

### Audit Trail
Every administrative action creates permanent audit records:
- **Transaction Records**: All credit awards logged as ADMIN_AWARD transactions
- **Timestamps**: Precise timing of all actions
- **Reasons**: Required reason field for all actions
- **Admin Identity**: System user ID tracks administrative actions

### Limits and Restrictions
- **Credit Awards**: No upper limit, but large amounts require confirmation
- **User Validation**: All usernames validated before action
- **State Integrity**: Scripts validate state file integrity before modifications
- **Rollback**: Backup files enable rollback of destructive operations

---

## Troubleshooting

### Common Issues

#### 1. User Not Found
```
Error: User with username "john_doe" not found
Available users:
  - alice_dev (user_123)
  - bob_helper (user_456)
  - carol_writer (user_789)
```
**Solution**: Check username spelling and case. Use exact username from the list.

#### 2. State File Issues
```
Error loading state: SyntaxError: Unexpected token in JSON
```
**Solutions**:
- Restore from backup if available
- Check file permissions
- Verify JSON syntax if manually edited

#### 3. Permission Errors
```
Error: EACCES: permission denied, open 'timebank-state.json'
```
**Solutions**:
- Check file system permissions
- Run with appropriate user privileges
- Verify script execution location

#### 4. Invalid Parameters
```
Error: Amount must be a positive integer
```
**Solution**: Ensure amount is a positive whole number (no decimals, no negative values).

### Recovery Procedures

#### If Script Fails Mid-Execution
1. **Stop Application**: Immediately stop the TimeBank application
2. **Check State**: Examine `timebank-state.json` for corruption
3. **Restore Backup**: Use most recent backup if state is corrupted
4. **Investigate**: Review error logs and script output
5. **Retry**: Re-run command with corrected parameters

#### If Wrong User Affected
1. **Document Error**: Record what happened and when
2. **Reverse Action**: Use appropriate script to reverse (e.g., award negative credits)
3. **Manual Correction**: Edit state file if necessary (with extreme caution)
4. **Notify Users**: Inform affected users of the correction

#### Emergency State Recovery
```bash
# Restore from backup
cp ./backups/timebank-state-backup-20241028.json ./timebank-state.json

# Verify restoration
npx tsx src/scripts/award-credit.ts --username "test_user" --amount 1 --reason "State verification test"
```

### Monitoring and Validation

#### State File Health Check
- **Size**: Monitor file size for unexpected growth
- **Syntax**: Validate JSON syntax regularly
- **Backups**: Maintain multiple backup versions
- **Integrity**: Check for missing or corrupted user/transaction records

#### Transaction Audit
- **Balance Verification**: Ensure user balances match transaction history
- **Double Payments**: Check for duplicate transaction IDs
- **System Consistency**: Verify all transactions have valid from/to users

---

## Best Practices

### Regular Maintenance
- **Weekly Backups**: Create weekly state backups
- **Monthly Audits**: Review transaction logs for anomalies
- **User Activity**: Monitor for suspicious patterns
- **Performance**: Check state file size and optimize if needed

### Credit Award Guidelines
- **Standard Amounts**: 25 TC (minor contribution), 50 TC (significant help), 100 TC (major contribution)
- **Clear Reasons**: Always provide specific, actionable reasons
- **Fair Distribution**: Ensure equitable treatment across community
- **Documentation**: Keep records of award criteria and decisions

### Emergency Procedures
- **Contact List**: Maintain list of technical contacts
- **Backup Strategy**: Multiple backup locations and schedules
- **Rollback Plan**: Tested procedures for state restoration
- **Communication**: Templates for user notifications during issues

---

## Transaction Types

The admin toolkit creates specific transaction types for audit purposes:

- `ADMIN_AWARD`: Credits awarded by administrators
- `SIGNUP_BONUS`: Initial credits given to new users  
- `GIG_PAYMENT`: Payments for completed gigs
- `BONUS`: Performance or community bonuses
- `PENALTY`: Deductions for violations
- `REFUND`: Refunded payments

## State Management

All scripts operate on the `timebank-state.json` file which contains:

```typescript
interface TimebankState {
  users: Record<string, User>;
  gigs: Record<string, Gig>;
  transactions: Record<string, Transaction>;
  currentUser?: string;
}
```

## Prerequisites

- Node.js and npm installed
- Access to the TimeBank state file (`timebank-state.json`)
- Administrative privileges
- TypeScript execution environment (`npx tsx` or similar)

## Security Considerations

1. **Access Control**: Admin scripts should only be run by authorized administrators
2. **Audit Trail**: All admin actions create permanent transaction records
3. **Backups**: Critical operations require backup creation
4. **Confirmation**: Destructive operations require multiple confirmations
5. **Logging**: All admin actions should be logged for review

---

*Last updated: October 28, 2024*