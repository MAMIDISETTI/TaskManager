# User Data Refactoring Plan

## Problem Statement

The current implementation stores all joiners data directly in the `users` table, which causes several issues:

1. **Data Duplication**: Same data exists in both `joiners` and `users` tables
2. **Role Change Issues**: When a trainee becomes a trainer, they still have trainee-specific data
3. **Data Inconsistency**: Changes in one table don't reflect in the other
4. **Storage Waste**: Unnecessary data storage
5. **Maintenance Complexity**: Need to update data in multiple places

## Proposed Solution: Reference-Based Approach

### New Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Users Table   │    │  Joiners Table  │
│                 │    │                 │
│ - author_id     │◄───┤ - userId        │
│ - name          │    │ - candidate_name│
│ - email         │    │ - phone_number  │
│ - password      │    │ - department    │
│ - role          │    │ - qualification │
│ - joinerId ─────┼────┤ - onboarding... │
│ - isActive      │    │ - dayPlanTasks  │
│ - lastClockIn   │    │ - fortnightExams│
│ - lastClockOut  │    │ - dailyQuizzes  │
└─────────────────┘    └─────────────────┘
```

### Benefits

1. **Single Source of Truth**: Role-specific data only in `joiners` table
2. **Easy Role Changes**: Just update the `role` field in `users` table
3. **Data Consistency**: No duplication, changes reflect everywhere
4. **Efficient Storage**: No redundant data
5. **Clean Separation**: User authentication vs. role-specific data

## Implementation Steps

### 1. New User Model (`UserNew.js`)
- Only stores essential user data
- References `joinerId` for role-specific information
- Includes methods for role updates and data retrieval

### 2. Migration Script (`migrateUserData.js`)
- Moves existing data to new structure
- Creates joiner records for users without them
- Updates references properly

### 3. Updated Controllers
- `authControllerNew.js`: Handles registration/login with references
- `userControllerNew.js`: Manages user operations with joiner data

### 4. Frontend Updates
- Update components to work with reference-based data
- Handle role changes gracefully
- Display data from both user and joiner records

## Migration Process

### Step 1: Backup Current Data
```bash
# Backup current database
mongodump --db taskmanager --out backup/
```

### Step 2: Run Migration
```bash
# Run migration script
node backend/scripts/migrateUserData.js
```

### Step 3: Update Controllers
- Replace old auth controller with new one
- Update user controller
- Test all endpoints

### Step 4: Update Frontend
- Modify components to use new data structure
- Handle role changes
- Update API calls

## Role Change Process

### Promoting a Trainee to Trainer
1. Update `role` in `users` table
2. Update `role` in `joiners` table
3. Clear trainee-specific assignments
4. Update UI to reflect new role

### Demoting a Trainer to Trainee
1. Update `role` in `users` table
2. Update `role` in `joiners` table
3. Clear trainer-specific assignments
4. Update UI to reflect new role

## Data Access Patterns

### Get User with Joiner Data
```javascript
const user = await User.findById(userId).populate('joinerData');
// Access: user.joinerData.qualification, user.joinerData.dayPlanTasks, etc.
```

### Update Role
```javascript
await user.updateRole('trainer');
// Updates both user.role and joinerData.role
```

### Create User with Joiner
```javascript
const user = await User.createWithJoiner(userData, joinerId);
```

## Rollback Plan

If issues arise, the migration script includes a rollback function:
```javascript
const { rollbackMigration } = require('./migrateUserData');
await rollbackMigration();
```

## Testing Checklist

- [ ] User registration works with new structure
- [ ] User login returns correct data
- [ ] Role changes work properly
- [ ] All existing functionality preserved
- [ ] Frontend displays data correctly
- [ ] No data loss during migration

## Future Benefits

1. **Scalability**: Easy to add new role types
2. **Maintainability**: Clear separation of concerns
3. **Performance**: No duplicate data queries
4. **Flexibility**: Easy to modify role-specific data structure
5. **Audit Trail**: Clear history of role changes

## Files Created

1. `backend/models/UserNew.js` - New user model
2. `backend/controllers/authControllerNew.js` - Updated auth controller
3. `backend/scripts/migrateUserData.js` - Migration script
4. `REFACTORING_PLAN.md` - This documentation

## Next Steps

1. Review and approve the new structure
2. Run migration in development environment
3. Test all functionality
4. Deploy to production
5. Monitor for any issues
