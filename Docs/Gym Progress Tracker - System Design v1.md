# Gym Progress Tracker — System Design v1

**Document Status:** Draft v1  
**Source Requirement:** Gym Progress Tracker — Requirement Document v1  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**System Type:** Offline-first mobile application  
**Date:** 2026-07-05

---

## 1. Purpose

This document defines the revised system design for **Gym Progress Tracker v1**, an offline-first mobile app for recording workouts, tracking exercise progress, recording bodyweight, and protecting local data through JSON export/import backup.

Version 1 remains intentionally simple:

- Android only.
- Standalone APK as the final runtime.
- React Native, Expo, TypeScript.
- SQLite local database.
- JSON export/import backup.
- No backend.
- No login.
- No cloud sync.
- No analytics or external tracking.

This document keeps the approved safety model and fixes three additional runtime flaws found during review:

1. Exercise block reordering now avoids immediate `UNIQUE(workout_id, exercise_order)` collisions.
2. Bodyweight records are explicitly one record per date.
3. Deleting a set now resequences remaining set numbers safely.

The approved safety decisions remain active: backup transformers, single-active-workout partial unique index, immediate write serialization, transactional set insertion, repeated exercise blocks, and historical backup fixtures.

---

## 2. Design Priorities

The system design is optimized for these priorities:

1. **Fast workout logging**  
   The user should be able to record sets quickly during real gym sessions.

2. **Immediate data persistence**  
   Each set must be saved immediately after the user records it. The app must not batch workout logs and save them later.

3. **Offline-first behavior**  
   Normal workout tracking must work without internet access.

4. **Database-backed integrity**  
   Critical rules should not rely only on UI or service-layer checks. SQLite constraints and transactions must protect important data rules.

5. **Backup safety across app updates**  
   Older backups should remain restorable through backup transformers when the app schema evolves.

6. **Simple but expandable architecture**  
   Version 1 should stay buildable, but the structure should not block future backend sync, workout templates, rest timer, or advanced analytics.

---

## 3. Scope of System Design v1

### Included

- Mobile app architecture.
- Feature-first source code structure.
- Navigation structure.
- Local SQLite data access strategy.
- Database integrity strategy.
- Workout write concurrency strategy.
- Backup export/import lifecycle.
- Backup migration transformer strategy.
- Validation strategy.
- Error handling strategy.
- Testing strategy.
- Android APK build strategy.

### Not Included

- Backend architecture.
- Cloud sync conflict resolution.
- Authentication.
- Multi-user support.
- AI workout coach.
- Nutrition tracking.
- Social features.
- Advanced charts and analytics.

---

## 4. System Context

Version 1 is a local-only Android mobile app.

```text
+------------------------------------------------+
|                 Android Phone                  |
|                                                |
|  Gym Progress Tracker                          |
|                                                |
|  +------------------------------------------+  |
|  | React Native Screens                     |  |
|  +------------------------------------------+  |
|  | Hooks / View Models                      |  |
|  +------------------------------------------+  |
|  | Services / Use Cases                     |  |
|  +------------------------------------------+  |
|  | Repositories                             |  |
|  +------------------------------------------+  |
|  | SQLite Adapter + Transactions            |  |
|  +------------------------------------------+  |
|                                                |
|  JSON Backup Export / Import                  |
+------------------------------------------------+
```

There is no server in v1. The only external interaction is the user manually selecting or sharing a JSON backup file.

---

## 5. Recommended Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Mobile framework | React Native | Mobile-first app development |
| Tooling | Expo | Faster development and build workflow |
| Language | TypeScript | Safer model, validation, and repository code |
| Local database | SQLite | Reliable local structured storage |
| Backup format | JSON | Portable manual backup format |
| Build tool | EAS Build | Standalone Android APK generation |
| Final runtime | Android standalone APK | Does not depend on Expo Go |

### Likely Expo modules

| Need | Suggested Module | Purpose |
|---|---|---|
| SQLite storage | `expo-sqlite` | Local database |
| Import backup file | `expo-document-picker` | Select JSON backup file |
| Export/share backup file | `expo-file-system` + `expo-sharing` | Create and share backup file |

Exact package versions should be checked during implementation because Expo SDK versions change over time.

---

## 6. High-Level Architecture

The app should use a simple layered architecture.

```text
UI Screens
  ↓
Feature Hooks / View Models
  ↓
Use Cases / Services
  ↓
Repositories
  ↓
SQLite Adapter
  ↓
SQLite Database
```

Backup flow:

```text
Settings / Backup Screen
  ↓
Backup Service
  ↓
Backup Parser
  ↓
Backup Version Transformer
  ↓
Backup Validator
  ↓
SQLite Transaction
  ↓
Replace Local Data
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| UI Screens | Render forms, lists, buttons, empty states, and confirmation dialogs. |
| Hooks / View Models | Manage loading state, form state, screen state, and call services. |
| Services / Use Cases | Apply app rules and coordinate repositories. |
| Repositories | Execute database reads and writes. |
| SQLite Adapter | Open database, run migrations, run explicit transactions. |
| Backup Service | Export current data and import backup data safely. |
| Backup Transformers | Convert older backup payloads into the current backup structure. |
| Validators | Validate forms, backup payloads, and transformed import data. |

---

## 7. Proposed Source Code Structure

```text
src/
  app/
    navigation/
      RootNavigator.tsx
      MainTabs.tsx
      WorkoutStack.tsx
      ExerciseStack.tsx
      SettingsStack.tsx

  database/
    db.ts
    migrations/
      index.ts
      001_initial_schema.ts
    seeds/
      defaultExercises.ts
    transaction.ts
    writeQueue.ts
    errors.ts

  features/
    workouts/
      screens/
        HomeScreen.tsx
        StartWorkoutScreen.tsx
        WorkoutHistoryScreen.tsx
        WorkoutDetailScreen.tsx
      components/
        WorkoutSummaryCard.tsx
        ExerciseBlock.tsx
        SetInputForm.tsx
        SetRow.tsx
      hooks/
        useActiveWorkout.ts
        useWorkoutHistory.ts
        useWorkoutDetail.ts
      services/
        workoutService.ts
      repositories/
        workoutRepository.ts
        workoutSetRepository.ts
      types.ts
      validators.ts

    exercises/
      screens/
        ExerciseSelectionScreen.tsx
        ExerciseDetailScreen.tsx
        ExerciseManagementScreen.tsx
      components/
        ExerciseListItem.tsx
        MuscleGroupFilter.tsx
        ExerciseForm.tsx
      hooks/
        useExerciseList.ts
        useExerciseDetail.ts
      services/
        exerciseService.ts
      repositories/
        exerciseRepository.ts
      types.ts
      validators.ts

    bodyRecords/
      screens/
        BodyRecordScreen.tsx
      components/
        BodyRecordForm.tsx
        BodyRecordList.tsx
      hooks/
        useBodyRecords.ts
      services/
        bodyRecordService.ts
      repositories/
        bodyRecordRepository.ts
      types.ts
      validators.ts

    backup/
      screens/
        BackupScreen.tsx
      services/
        backupExportService.ts
        backupImportService.ts
      transformers/
        index.ts
        v1ToV2.ts
      validators/
        backupEnvelopeValidator.ts
        backupDataValidator.ts
      fixtures/
        backup-v1-valid.json
        backup-v1-invalid-multiple-active-workouts.json
      types.ts

  shared/
    components/
      ConfirmDialog.tsx
      EmptyState.tsx
      LoadingState.tsx
    utils/
      id.ts
      date.ts
      number.ts
      result.ts
```

### Important rule

The `backup/fixtures/` directory must keep example JSON payloads for every historical `backup_version`. These fixtures are part of the app's data-safety contract and should not be deleted when the app evolves.

---

## 8. Navigation Design

Recommended structure:

```text
RootNavigator
  └── MainTabs
        ├── Home
        ├── Workouts
        ├── Exercises
        ├── Body
        └── Settings
```

### Main Screens

| Screen | Purpose |
|---|---|
| Home | Start or continue workout, show latest workout and bodyweight summary. |
| Start Workout | Create or continue the current active workout. |
| Exercise Selection | Select exercise to add to the current workout. |
| Workout History | View previous workouts newest first. |
| Workout Detail | View exercises and sets from one workout. |
| Exercise Detail | View last record, best weight, and exercise history. |
| Exercise Management | Add, edit, archive, or delete custom exercises. |
| Body Record | Add and review bodyweight records. |
| Backup Settings | Export and import JSON backup. |

---

## 9. Core Domain Model

### 9.1 Main entities

| Entity | Description |
|---|---|
| Exercise | Default or custom exercise. |
| Workout | A workout session. |
| Workout Exercise | One exercise block inside a workout. |
| Workout Set | One set inside a workout exercise block. |
| Body Record | One bodyweight record. |

### 9.2 Why `workout_exercises` is required

The requirement says the user can add an exercise to a workout and then record sets. If the app only stores `workout_sets`, an exercise would not exist inside the workout until the first set is saved.

That is weak because the user may add an exercise first, then record sets later.

Therefore, this design uses:

```text
workouts
  → workout_exercises
      → workout_sets
```

This allows:

- Exercise blocks with zero sets.
- Exercise order inside the workout.
- Repeated exercise blocks in the same workout.
- Chronological workout review.
- Future support for supersets or exercise block notes.

---

## 10. Repeated Exercise Block Design

The database must allow the same exercise to appear more than once in a workout.

Example:

```text
Workout A
1. Bicep Curl
2. Tricep Pushdown
3. Bicep Curl
```

This is handled by `workout_exercises.exercise_order`, not by a unique `(workout_id, exercise_id)` constraint.

### UI behavior for v1

When the user selects an exercise that already exists in the active workout:

```text
Default behavior:
- Focus the latest existing exercise block.

Optional user action:
- Show "Add again" to append a new exercise block at the bottom.
```

This keeps the beginner flow fast while still allowing the database to represent repeated exercise blocks correctly.

---

## 11. Exercise Block Reordering Strategy

### 11.1 Problem

The database enforces:

```sql
UNIQUE(workout_id, exercise_order)
```

That rule is correct, but naive swaps can fail because SQLite checks unique constraints immediately. For example, changing Block A from order `1` to order `2` can collide with Block B, which is still using order `2`.

### 11.2 Required solution

Keep `UNIQUE(workout_id, exercise_order)`, but implement `moveExerciseBlock()` and future drag-and-drop reorder operations using a safe transaction.

Because the schema also requires `CHECK(exercise_order > 0)`, the app must not use temporary negative values. Use temporary positive parking values instead.

Required flow:

```text
BEGIN TRANSACTION
  Read all exercise blocks for the workout.
  Build the final ordered list in memory.
  Move affected rows to temporary positive parking orders.
  Write final positive exercise_order values starting from 1.
COMMIT
```

Example swap:

```text
Initial:
A = 1
B = 2

Parking:
A = 1000001
B = 1000002

Final:
A = 2
B = 1
```

Rules:

- Reorder must run inside one SQLite transaction.
- Reorder must not directly update a row into an order value currently used by another row.
- Temporary parking values must be positive.
- After commit, visible `exercise_order` values should be compact and sequential: `1, 2, 3, ...`.
- If reorder fails, rollback must preserve the previous order.

---

## 12. Data Integrity Strategy

The system should use both application-level validation and database-level constraints.

### 12.1 App-level validation

Used for friendly error messages:

- Required fields.
- Positive reps.
- Weight must be zero or greater.
- Bodyweight must be greater than zero.
- Workout status must be valid.
- Import file must have the correct structure.

### 12.2 Database-level validation

Used as the final safety guard:

- Primary keys.
- Foreign keys.
- `CHECK` constraints.
- Unique indexes.
- Partial unique index for single active workout.
- Transactional import.

### 12.3 Single active workout rule

Only one workout can have status `in_progress` at a time.

This rule must be enforced in SQLite:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_workouts_single_in_progress
ON workouts(status)
WHERE status = 'in_progress';
```

The service layer should still check for an active workout before creating one, but the database is the final source of truth.

---

## 13. Workout Write Concurrency Strategy

Workout logging is the most sensitive write path because it happens during real gym sessions and must be fast.

### 13.1 Problem

The following actions can happen quickly:

- Double-tapping Start Workout.
- Double-tapping Add Set.
- Adding a set while the previous insert is still running.
- Closing or backgrounding the app immediately after logging a set.

A weak implementation can create:

- Multiple active workouts.
- Duplicate set numbers.
- Constraint errors shown to the user.
- Lost pending writes.

### 13.2 Required design

The app must use a `WorkoutWriteQueue` with these rules:

```text
The queue serializes concurrent workout write promises.
The queue must not batch writes for later.
The queue must not keep unsaved workout data waiting in memory.
Each queued operation must immediately execute against SQLite when it reaches the front of the queue.
Each operation should resolve before the UI treats the record as saved.
```

This queue is only an in-process concurrency guard. It is not a persistence layer.

### 13.3 Mobile lifecycle risk

React Native JavaScript can be suspended when the app goes to the background. Android can later kill the process for memory. Therefore, any design that stores pending workout writes in a delayed JS queue is unsafe.

Mitigation:

```text
Do not use delayed write batching.
Do not show a set as saved until SQLite insert succeeds.
Disable or debounce the submit button while the write is in progress.
Keep each write small and immediate.
Use SQLite transactions for multi-step writes.
```

### 13.4 Set insertion transaction

Set creation must calculate the next `set_number` and insert the set inside the same explicit transaction.

Required operation:

```text
BEGIN TRANSACTION
  SELECT COALESCE(MAX(set_number), 0) + 1
  FROM workout_sets
  WHERE workout_exercise_id = ?;

  INSERT INTO workout_sets (..., set_number, ...)
  VALUES (...);
COMMIT
```

The `WorkoutWriteQueue` prevents concurrent JS writes from the app process, and the SQLite transaction protects the read/write operation as one unit.

### 13.5 Database final guard

The database must also enforce:

```sql
UNIQUE(workout_exercise_id, set_number)
```

If a constraint error still happens, the repository should return a controlled error and the UI should reload the exercise block instead of pretending the data was saved.

---

## 14. Start Workout Flow

### 14.1 Normal flow

```text
User taps Start Workout
  ↓
Service asks repository for existing in_progress workout
  ↓
If found: return existing workout
  ↓
If not found: attempt to insert new in_progress workout
  ↓
Navigate to Start Workout screen
```

### 14.2 Double-tap-safe flow

If two create requests happen at nearly the same time, the partial unique index may reject the second insert.

Repository behavior must be:

```text
Try insert new in_progress workout
  ↓
If insert succeeds:
  return new workout
  ↓
If SQLITE_CONSTRAINT_UNIQUE from ux_workouts_single_in_progress:
  query current in_progress workout
  return existing workout
  ↓
If another error:
  return controlled failure
```

The UI should not show a crash screen for this expected race condition.

---

## 15. Add Exercise to Workout Flow

```text
User taps Add Exercise
  ↓
Exercise Selection Screen opens
  ↓
User selects an exercise
  ↓
Service checks whether exercise already exists in active workout
  ↓
If not found:
  append new workout_exercises row with next exercise_order
  ↓
If found:
  focus latest existing block by default
  optionally offer "Add again"
  ↓
Return to Start Workout Screen
```

### Add Again behavior

If the user chooses **Add again**, create a new `workout_exercises` row with:

```text
same workout_id
same exercise_id
new exercise_order
new workout_exercise_id
```

The sets recorded under each block remain separate.

---

## 16. Add Set Flow

```text
User enters weight and reps
  ↓
UI validates input
  ↓
Submit button is disabled while save is in progress
  ↓
WorkoutWriteQueue receives operation
  ↓
Repository opens SQLite transaction
  ↓
Repository calculates next set_number for workout_exercise_id
  ↓
Repository inserts set
  ↓
Transaction commits
  ↓
UI reloads the exercise block
  ↓
Input may auto-fill previous weight for faster logging
```

The user should only see the set as saved after the transaction succeeds.

---

## 17. Delete Set and Resequence Flow

### 17.1 Problem

If the user records Sets `1, 2, 3` and deletes Set 2, a naive design leaves `1, 3`. The next insert using `MAX(set_number) + 1` would create Set 4, resulting in `1, 3, 4`.

This is not data corruption, but it looks broken to the user and weakens workout history readability.

### 17.2 Required behavior

For v1, set numbers should remain compact inside each exercise block.

Required flow:

```text
User deletes set
  ↓
Repository opens SQLite transaction
  ↓
Repository reads workout_exercise_id and set_number of deleted set
  ↓
Repository deletes the selected set
  ↓
Repository resequences remaining sets in that workout_exercise_id
  ↓
Transaction commits
  ↓
UI reloads the exercise block
```

### 17.3 Safe resequencing rule

Because `UNIQUE(workout_exercise_id, set_number)` is immediate and the schema requires `CHECK(set_number > 0)`, resequencing must use temporary positive parking values.

Example:

```text
After deleting Set 2:
1, 3, 4

Parking:
1, 1000003, 1000004

Final:
1, 2, 3
```

After commit, set numbers for one exercise block should be sequential: `1, 2, 3, ...`.

### 17.4 Update set behavior

Editing an existing set should not normally change `set_number`. If a future reorder-sets feature is added, it must use the same parking-value transaction pattern as exercise block reordering.

---

## 18. Complete Workout Flow

```text
User taps Finish Workout
  ↓
App confirms if necessary
  ↓
Repository updates workout status to completed
  ↓
completed_at is filled
  ↓
Home and history screens show completed workout
```

Validation:

```text
status must be completed
completed_at must be filled when completed
completed_at must be null when in_progress
```

---

## 19. Backup Export Design

### 19.1 Export goal

Export should create a complete portable JSON backup that can restore the app data later.

### 19.2 Backup envelope

```ts
type BackupEnvelope = {
  app_name: "Gym Progress Tracker";
  backup_version: number;
  app_schema_version: number;
  exported_at: string;
  exported_app_version?: string;
  data: BackupData;
};
```

### 19.3 Current backup version

For this design:

```text
current_backup_version = 1
current_app_schema_version = 1
```

### 19.4 Exported data sections

```ts
type BackupData = {
  exercises: ExerciseBackupRow[];
  workouts: WorkoutBackupRow[];
  workout_exercises: WorkoutExerciseBackupRow[];
  workout_sets: WorkoutSetBackupRow[];
  body_records: BodyRecordBackupRow[];
};
```

### 19.5 Export rules

- Export all non-internal user data.
- Include archived exercises because history depends on them.
- Include stable IDs.
- Include timestamps.
- Include backup version.
- Include app schema version.
- Do not include analytics, device identifiers, or external tracking data.

---

## 20. Backup Import Lifecycle

### 20.1 Import goal

The app must restore valid backup files safely, including older backup versions that have a supported transformer path.

### 20.2 Import flow

```text
User selects JSON file
  ↓
Parse JSON
  ↓
Validate backup envelope shape
  ↓
Read backup_version
  ↓
If backup_version > current_backup_version:
  reject because backup was created by a newer app
  ↓
If backup_version < current_backup_version:
  transform step-by-step until current version
  ↓
If backup_version === current_backup_version:
  continue
  ↓
Validate transformed backup data against current schema
  ↓
Validate referential integrity
  ↓
Validate only one in_progress workout
  ↓
Show confirmation warning
  ↓
Run replace import inside one SQLite transaction
  ↓
Commit if all inserts pass
  ↓
Rollback if any step fails
```

### 20.3 Unsupported backup definition

A backup should be rejected only when:

- It is not valid JSON.
- It does not contain the required envelope fields.
- It was created by a newer backup version.
- It uses an old version with no available transformer.
- It fails validation after transformation.
- It violates required integrity rules.

Older backups should not be rejected simply because they are older.

### 20.4 Backup transformer chain

When the app reaches future versions, transformers should be chained:

```text
v1 backup → transform v1 to v2
v2 backup → transform v2 to v3
v3 backup → transform v3 to v4
...
current backup version
```

Transformers should be pure functions:

```ts
type BackupTransformer = (input: unknown) => unknown;
```

They should not write to SQLite directly. They only convert JSON data into the next supported backup shape.

### 20.5 Historical backup fixtures

For every previous `backup_version`, the repository must maintain JSON test fixtures.

Required fixtures:

```text
src/features/backup/fixtures/
  backup-v1-valid.json
  backup-v1-invalid-multiple-active-workouts.json
```

When v2 exists, add:

```text
  backup-v2-valid.json
  backup-v2-invalid.json
```

Testing rule:

```text
Every supported historical backup_version must have test fixtures.
Every backup transformer must have unit tests.
Every app release must verify old valid backups still import successfully.
```

This is mandatory because backup is a core data-safety feature, not a convenience feature.

---

## 21. Replace-Style Import Transaction

Version 1 uses replace-style import, not merge import.

The replace import must be atomic:

```text
BEGIN TRANSACTION
  DELETE FROM workout_sets;
  DELETE FROM workout_exercises;
  DELETE FROM workouts;
  DELETE FROM body_records;
  DELETE FROM exercises;

  INSERT exercises;
  INSERT workouts;
  INSERT workout_exercises;
  INSERT workout_sets;
  INSERT body_records;
COMMIT
```

If any insert fails:

```text
ROLLBACK
Previous local data remains unchanged
Show import failure message
```

### Important precondition

The app must validate the transformed backup before the transaction starts.

The transaction is the final safety layer, but validation should catch predictable issues before deleting current data inside the transaction.

---

## 22. Database Migration Strategy

The app must use versioned SQLite migrations.

Startup flow:

```text
Open database
  ↓
Enable foreign keys
  ↓
Read current schema version from app_meta
  ↓
Run missing migrations in order
  ↓
Update schema version
  ↓
Seed default exercises idempotently
```

Rules:

- Never reset the database automatically during normal migration.
- Never delete workout history during migration.
- Migrations must be deterministic.
- Migrations should be covered by tests.
- Backup version and database schema version are related but not the same thing.

### Backup version vs database schema version

| Version Type | Purpose |
|---|---|
| Database schema version | Tracks the local SQLite table structure. |
| Backup version | Tracks the exported JSON backup structure. |
| App version | Tracks the installed application release. |

A schema migration does not always require a backup version change, but if exported JSON structure changes, backup version must change.

---

## 23. Repository Error Handling

Repositories should return controlled results instead of throwing raw database errors into the UI.

Recommended result style:

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };
```

### Important errors

| Error | Repository behavior | UI behavior |
|---|---|---|
| Unique active workout constraint | Query and return existing active workout. | Continue to workout screen. |
| Duplicate set number constraint | Reload exercise block and show retry message if needed. | Do not show crash screen. |
| Duplicate exercise order during reorder | Roll back reorder and reload workout blocks. | Keep previous order visible. |
| Duplicate body record date | Return existing record or update-intent result. | Ask user whether to update the existing record. |
| Foreign key failure | Return data integrity error. | Show controlled message. |
| Invalid backup | Return validation error. | Show readable import failure reason. |
| Transaction failure | Roll back and return failure. | Tell user previous data remains unchanged. |

---

## 24. Validation Strategy

### Workout validation

- `workout_date` is required.
- `status` must be `in_progress` or `completed`.
- `completed_at` must be filled only when status is `completed`.
- Only one workout can be `in_progress`.

### Exercise validation

- Name is required.
- Muscle group is required.
- Equipment is optional.
- Used exercises must be archived instead of permanently deleted.

### Workout exercise validation

- `workout_id` must exist.
- `exercise_id` must exist.
- `exercise_order` must be greater than zero.
- `exercise_order` must be unique inside one workout.
- Repeated `exercise_id` is allowed inside one workout.

### Set validation

- `workout_exercise_id` must exist.
- Weight is required.
- Weight must be zero or greater.
- Reps are required.
- Reps must be greater than zero.
- Reps must be a whole number.
- Set number must be greater than zero.
- Set number must be unique inside one workout exercise block.

### Body record validation

- Record date is required.
- Only one bodyweight record is allowed per `record_date`.
- If the user enters bodyweight again for the same date, the app should offer to update the existing record instead of creating a duplicate.
- Bodyweight is required.
- Bodyweight must be greater than zero.

### Backup validation

- File must be valid JSON.
- Envelope must contain `app_name`.
- Envelope must contain `backup_version`.
- Envelope must contain `app_schema_version`.
- Envelope must contain `exported_at`.
- Envelope must contain required data sections.
- Transformed data must match current backup shape.
- Referenced IDs must exist.
- Backup must not contain more than one `in_progress` workout.

---

## 25. Privacy and Permissions

Version 1 should avoid unnecessary permissions.

The app should not include:

- Analytics.
- Ads.
- External tracking.
- Automatic cloud upload.
- Account requirement.

Permissions should be limited to what is required for backup import/export.

---

## 26. Testing Strategy

### 26.1 Unit tests

Required tests:

- Workout validation.
- Exercise validation.
- Set validation.
- Body record validation.
- One bodyweight record per date validation.
- ID generation format.
- Backup envelope validation.
- Backup data validation.
- Backup transformers.
- Historical backup fixture imports.

### 26.2 Repository tests

Required tests:

- Create workout.
- Return existing active workout on double create.
- Enforce single active workout partial unique index.
- Add exercise block.
- Move exercise block using parking-value transaction.
- Reorder rollback preserves old order after failure.
- Add same exercise again as a new block.
- Focus latest existing exercise block by default.
- Add set with transaction-safe set number.
- Prevent duplicate set number.
- Delete set resequences remaining set numbers.
- Resequence rollback preserves old sets after failure.
- Archive used exercise.
- Delete unused custom exercise.
- Transaction-safe import rollback.

### 26.3 Concurrency tests

Required tests:

- Rapid double tap Start Workout creates only one active workout.
- Rapid Add Set calls produce sequential set numbers.
- Rapid delete/add set operations keep compact set numbers.
- Constraint errors are handled without crashing.
- UI does not mark set as saved before repository success.

### 26.4 Backup lifecycle tests

Required tests:

- Current backup exports successfully.
- Current backup imports successfully.
- Historical v1 fixture imports successfully.
- Invalid backup with multiple active workouts is rejected.
- Newer backup version is rejected clearly.
- Old backup with no transformer is rejected clearly.
- Failed import leaves existing local data unchanged.

### 26.5 Real gym usage tests

Required tests:

- Start workout quickly.
- Add exercise quickly.
- Add sets quickly.
- Close and reopen app during an unfinished workout.
- Continue unfinished workout.
- Review last exercise record during workout.
- Export backup.
- Import backup on a fresh install.

---

## 27. Android APK Build Strategy

Version 1 final runtime must be a standalone Android APK.

Recommended flow:

```text
Early development:
- Expo Go may be used temporarily.

Serious development:
- Expo development build.

Final testing:
- Standalone Android APK through EAS Build.

Real usage:
- Install APK on Android phone.
```

The APK should be tested during real gym sessions, not only on an emulator.

---

## 28. Implementation Order

Recommended order after design approval:

1. Initialize React Native Expo TypeScript project.
2. Add navigation shell.
3. Add SQLite adapter.
4. Add migration runner.
5. Implement the approved database schema.
6. Seed default exercises idempotently.
7. Implement workout repositories.
8. Implement `WorkoutWriteQueue`.
9. Implement active workout flow.
10. Implement add exercise block flow.
11. Implement add set transaction flow.
12. Implement delete set resequencing transaction.
13. Implement safe exercise block reordering transaction.
14. Implement workout history and detail.
15. Implement exercise history and best weight.
16. Implement bodyweight records with one-record-per-date behavior.
17. Implement backup export.
18. Implement backup import validation and transaction.
19. Add backup fixtures and transformer tests.
20. Test rapid input and app restart behavior.
21. Build standalone Android APK.
22. Test during real gym usage.

---

## 29. Design Decisions Summary

| Decision | Status | Reason |
|---|---|---|
| Use SQLite local database | Accepted | Required for offline-first structured storage. |
| Use stable string IDs | Accepted | Safer export/import and future sync. |
| Add `workout_exercises` table | Accepted | Supports exercise blocks before sets exist. |
| Allow repeated exercise blocks | Accepted | Preserves chronological workout reality. |
| `workout_sets` references `workout_exercise_id` | Accepted | Stronger relational model. |
| Enforce one active workout using partial unique index | Accepted | Prevents ghost active workouts. |
| Use `WorkoutWriteQueue` | Accepted with constraint | Only serialize immediate writes; no delayed batching. |
| Calculate set number inside transaction | Accepted | Prevents race condition during rapid logging. |
| Safe exercise block reorder transaction | Required | Prevents immediate unique constraint collisions during swaps. |
| Delete set resequencing transaction | Required | Keeps visible set numbers compact after deletion. |
| One bodyweight record per date | Required | Prevents duplicate daily bodyweight records. |
| Use backup transformers | Accepted | Allows old backups to survive app updates. |
| Maintain historical backup fixtures | Required | Protects long-term backup compatibility. |
| Replace import only | Accepted for v1 | Simpler and avoids merge conflicts. |
| No backend in v1 | Accepted | Keeps MVP realistic. |

---

## 30. Remaining Known Tradeoffs

1. **Backup transformers create long-term maintenance work.**  
   This is acceptable because data safety is a core feature. The mitigation is mandatory historical fixtures and transformer tests.

2. **Repeated exercise blocks add UI complexity.**  
   This is controlled by focusing the latest existing block by default and only appending a duplicate block when the user chooses **Add again**.

3. **Set numbering needs resequencing after deletion.**  
   This is acceptable because the repository owns all set deletion and can keep the UI simple by making set numbers compact after every delete.

4. **Exercise block reordering is more complex than direct updates.**  
   This is acceptable because the complexity is hidden inside the repository and prevents unique constraint failures.

5. **Replace import is destructive.**  
   This is acceptable for v1 only because import requires validation, confirmation, transaction rollback safety, and a recommendation to export current data first.

---

## 31. Conclusion

System Design v1 keeps the MVP simple but fixes the additional runtime bugs found after the design review.

The revised design is stronger because it treats SQLite as the final integrity layer, avoids delayed workout write batching, supports repeated exercise blocks, defines a backup migration lifecycle, avoids reorder constraint traps, restores one-record-per-day bodyweight integrity, and keeps set numbers compact after deletion.

The next step after accepting this document is to review **the Database Design**, because the schema and repository contracts must reflect these system-level decisions.
