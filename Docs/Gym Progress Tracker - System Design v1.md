# Gym Progress Tracker — System Design v1

**Document Status:** Draft v1  
**Source Requirement:** Gym Progress Tracker — Requirement Document v1  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**System Type:** Offline-first mobile application  
**Primary User:** Beginner gym user  
**Date:** 2026-06-29

---

## 1. Purpose

This document translates the frozen Requirement Document v1 into a practical system design for the first version of **Gym Progress Tracker**.

The design focuses on building a simple, fast, offline-first mobile app that can be used during real gym sessions. Version 1 does not include login, backend, cloud sync, AI features, nutrition tracking, social features, or advanced analytics.

---

## 2. Design Priorities

The system design is optimized for these priorities:

1. **Fast workout logging**  
   The user should be able to record sets quickly during a workout without fighting the UI.

2. **Offline-first behavior**  
   All normal app features must work without internet.

3. **Immediate data saving**  
   Each set should be saved immediately after entry, not only at the end of the workout.

4. **Data safety**  
   The app should protect workout history through SQLite persistence, versioned migrations, and JSON export/import backup.

5. **Simple architecture**  
   The app should be structured enough to grow later, but not over-engineered for version 1.

6. **Future backend compatibility**  
   Stable local string IDs and timestamps should make future sync easier if a backend is added later.

---

## 3. Scope of System Design v1

### Included

- Mobile app architecture
- Local SQLite database design
- Feature module structure
- Navigation structure
- Core data flows
- Backup export/import flow
- Validation strategy
- Migration strategy
- Error handling strategy
- Testing strategy
- Android APK build strategy

### Not Included

- Backend architecture
- Cloud database design
- Authentication system
- Multi-user support
- Online sync conflict resolution
- AI workout recommendation
- Advanced analytics
- Nutrition tracking

---

## 4. System Context

Version 1 is a local-only Android mobile app.

```text
+-----------------------------+
|       Android Phone         |
|                             |
|  Gym Progress Tracker App   |
|                             |
|  +-----------------------+  |
|  | React Native UI       |  |
|  +-----------------------+  |
|  | Feature Logic         |  |
|  +-----------------------+  |
|  | Repositories          |  |
|  +-----------------------+  |
|  | SQLite Local DB       |  |
|  +-----------------------+  |
|                             |
|  JSON Backup Export/Import  |
+-----------------------------+
```

There is no server in version 1. The only external interaction is the user manually exporting or importing a JSON backup file.

---

## 5. Recommended Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Mobile framework | React Native | Mobile-first app development |
| App platform/tooling | Expo | Faster development and Android build workflow |
| Language | TypeScript | Safer model, validation, and repository code |
| Local database | SQLite | Reliable local structured storage |
| Backup format | JSON | Easy manual export/import and future compatibility |
| Build tool | EAS Build | Standalone Android APK generation |
| Final runtime | Android standalone APK | Must not depend on Expo Go |

### Likely Expo modules for version 1

| Need | Suggested Module | Purpose |
|---|---|---|
| SQLite storage | `expo-sqlite` | Local database |
| Import backup file | `expo-document-picker` | Let user select JSON backup file |
| Export/share backup file | `expo-file-system` + `expo-sharing` | Create and share/export backup JSON |

Exact package versions should be checked during implementation because Expo SDK versions change over time.

---

## 6. High-Level Architecture

The app should use a simple layered architecture:

```text
UI Screens
  ↓
Feature Hooks / View Models
  ↓
Use Cases / Services
  ↓
Repositories
  ↓
SQLite Database Adapter
```

For backup:

```text
Settings / Backup Screen
  ↓
Backup Service
  ↓
Backup Validator
  ↓
Repositories / SQLite Transaction
  ↓
JSON File Export or Import
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| UI Screens | Render forms, lists, buttons, empty states, confirmation dialogs |
| Feature Hooks / View Models | Manage screen state, loading state, form state, and call use cases |
| Use Cases / Services | Apply app rules and coordinate repositories |
| Repositories | Read/write data from SQLite |
| Database Adapter | Open database, run migrations, run transactions |
| Backup Service | Export/import full app data |
| Validators | Validate form input and backup structure |

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
      defaultExercises.ts
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
        backupValidator.ts
      types.ts

  database/
    database.ts
    migrations/
      migration001_initialSchema.ts
    migrationRunner.ts
    transaction.ts
    seedDefaultExercises.ts

  shared/
    components/
      AppButton.tsx
      AppTextInput.tsx
      ConfirmDialog.tsx
      EmptyState.tsx
      LoadingState.tsx
    constants/
      muscleGroups.ts
      units.ts
    utils/
      date.ts
      id.ts
      number.ts
      result.ts
    errors/
      AppError.ts
```

### Design Note

The structure is feature-first. Each major feature owns its screens, hooks, services, repositories, types, and validators. Shared UI and utility code stays under `shared/`.

---

## 8. Navigation Design

### Main Tabs

```text
Home
Workouts
Exercises
Body
Settings
```

### Screen Map

| Screen | Access Path | Purpose |
|---|---|---|
| Home Screen | Home tab | Quick access to active workout, latest workout, recent progress, latest bodyweight |
| Start Workout Screen | Home → Start Workout / Continue Workout | Create or continue an active workout |
| Exercise Selection Screen | Start Workout → Add Exercise | Choose exercise or create custom exercise |
| Workout History Screen | Workouts tab | View previous workouts newest first |
| Workout Detail Screen | Workout History → Workout Detail | Review exercises and sets in a workout |
| Exercise Detail Screen | Exercises → Exercise Detail | View last record, best weight, history |
| Exercise Management Screen | Exercises tab | Manage default/custom exercises |
| Body Record Screen | Body tab | Add and review bodyweight records |
| Settings / Backup Screen | Settings tab | Export/import backup and app info |

---

## 9. Data Model Overview

### Entity Relationship

```text
workouts
  1 ─── * workout_exercises
            * ─── 1 exercises

workouts
  1 ─── * workout_sets
            * ─── 1 exercises

body_records
  independent table
```

### Important Design Addition: `workout_exercises`

The Requirement Document defines `workout_sets`, but it does not define a table for an exercise that has been added to a workout before any set has been recorded.

To support this requirement cleanly, the system design adds a technical join table:

```text
workout_exercises
```

This table allows the app to show an exercise block inside the active workout even when it still has zero sets.

This is not a new user-facing feature. It is a technical table needed to implement the existing “add exercise to workout session” behavior safely.

---

## 10. SQLite Schema Design

SQLite should use `TEXT` for IDs and ISO date/time values, `REAL` for weights, and `INTEGER` for reps and boolean-like values.

### 10.1 `exercises`

```sql
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Notes

- `is_custom = 0` means default exercise.
- `is_custom = 1` means user-created exercise.
- `is_archived = 1` hides the exercise from normal selection.
- Used exercises should be archived instead of permanently deleted.

---

### 10.2 `workouts`

```sql
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  workout_date TEXT NOT NULL,
  title TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (status = 'completed' AND completed_at IS NOT NULL)
    OR
    (status = 'in_progress' AND completed_at IS NULL)
  )
);
```

#### Notes

- `workout_date` stores the user-selected date.
- `started_at` stores when the workout session was created.
- `completed_at` is filled only after the workout is completed.
- Only one active `in_progress` workout should normally exist in version 1.

SQLite does not support partial uniqueness in all simple migration styles consistently across tooling, so the “only one active workout” rule can be enforced in the service layer for version 1.

---

### 10.3 `workout_exercises`

```sql
CREATE TABLE workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
  UNIQUE (workout_id, exercise_id)
);
```

#### Notes

- Supports an exercise block inside a workout before the first set is entered.
- Keeps exercise ordering stable inside a workout.
- For version 1, the same exercise should appear only once in the same workout. If the user selects it again, the app should focus the existing exercise block.

---

### 10.4 `workout_sets`

```sql
CREATE TABLE workout_sets (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
  CHECK (set_number > 0),
  CHECK (weight >= 0),
  CHECK (reps > 0),
  UNIQUE (workout_id, exercise_id, set_number)
);
```

#### Notes

- Every set is saved immediately.
- `weight` uses kilograms only.
- `weight = 0` is allowed for bodyweight-only or unloaded movements.
- `reps` must be a whole number greater than zero.
- `set_number` is unique per workout and exercise.

---

### 10.5 `body_records`

```sql
CREATE TABLE body_records (
  id TEXT PRIMARY KEY,
  record_date TEXT NOT NULL,
  body_weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (body_weight > 0),
  UNIQUE (record_date)
);
```

#### Notes

- Version 1 stores one bodyweight record per date.
- If the user records bodyweight again for the same date, the app should ask whether to update the existing record instead of silently creating duplicates.

---

### 10.6 `app_meta`

```sql
CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

#### Notes

Used to store internal metadata such as:

- Current database schema version
- Last successful migration timestamp
- App data version

---

## 11. Index Strategy

Indexes should support the most common queries.

```sql
CREATE INDEX idx_workouts_date ON workouts(workout_date DESC);
CREATE INDEX idx_workouts_status ON workouts(status);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id, exercise_order);
CREATE INDEX idx_workout_exercises_exercise ON workout_exercises(exercise_id);

CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_workout_sets_exercise_created ON workout_sets(exercise_id, created_at DESC);

CREATE INDEX idx_body_records_date ON body_records(record_date DESC);

CREATE INDEX idx_exercises_group_archived ON exercises(muscle_group, is_archived);
```

---

## 12. ID Strategy

All main records should use stable local string IDs.

| Entity | Prefix | Example |
|---|---|---|
| Exercise | `ex_` | `ex_chest_press_machine` or `ex_a1b2c3` |
| Workout | `wo_` | `wo_a1b2c3` |
| Workout Exercise | `wex_` | `wex_a1b2c3` |
| Workout Set | `set_` | `set_a1b2c3` |
| Body Record | `br_` | `br_a1b2c3` |

### Default Exercise IDs

Default exercises should use stable readable IDs, for example:

```text
ex_chest_press_machine
ex_lat_pulldown
ex_seated_row
ex_leg_press
ex_shoulder_press_machine
ex_lateral_raise
ex_bicep_curl
ex_tricep_pushdown
ex_leg_extension
ex_leg_curl
```

Custom exercises should use generated IDs.

---

## 13. SQLite Migration Strategy

The app should never reset the database automatically during development or update.

### Migration Flow

```text
App starts
  ↓
Open SQLite database
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
  ↓
App becomes usable
```

### Rules

1. Every schema change must be versioned.
2. Migrations must run in order.
3. A failed migration must stop startup and show a safe error.
4. Default exercises must be seeded idempotently using stable IDs.
5. Seeding must not duplicate existing exercises.
6. Seeding must not overwrite user-edited or archived state unless explicitly intended.

---

## 14. App Startup Flow

```text
Launch app
  ↓
Initialize database
  ↓
Run migrations
  ↓
Seed default exercises
  ↓
Check for in-progress workout
  ↓
Load home screen data
  ↓
Show Home screen
```

If an in-progress workout exists, the Home screen should show a clear **Continue Workout** action.

---

## 15. Core Feature Flows

## 15.1 Start Workout Flow

```text
User taps Start Workout
  ↓
App checks existing in-progress workout
  ↓
If active workout exists:
  show Continue Workout option
  ↓
If no active workout:
  create workout with status = in_progress
  ↓
Open Start Workout Screen
```

### Data Created

```text
workouts row
```

---

## 15.2 Add Exercise to Workout Flow

```text
User taps Add Exercise
  ↓
Exercise Selection Screen opens
  ↓
User selects exercise
  ↓
App creates workout_exercises row
  ↓
Start Workout Screen shows exercise block
```

### Data Created

```text
workout_exercises row
```

If the exercise already exists in the current workout, the app should not create a duplicate. It should navigate back and focus the existing exercise block.

---

## 15.3 Add Set Flow

```text
User enters weight and reps
  ↓
App validates input
  ↓
App calculates next set_number
  ↓
App inserts workout_sets row immediately
  ↓
UI updates set list
  ↓
Next input can auto-fill previous weight
```

### Data Created

```text
workout_sets row
```

### Important Rule

The app must save each set immediately after the user records it. It should not wait until the workout is completed.

---

## 15.4 Complete Workout Flow

```text
User taps Finish Workout
  ↓
App confirms if needed
  ↓
App updates workout status to completed
  ↓
App sets completed_at
  ↓
Workout becomes visible in history
```

### Data Updated

```text
workouts.status = completed
workouts.completed_at = now
```

---

## 15.5 Continue Unfinished Workout Flow

```text
App starts
  ↓
App finds workout where status = in_progress
  ↓
Home shows Continue Workout
  ↓
User taps Continue Workout
  ↓
Start Workout Screen loads existing exercises and sets
```

This implements the requirement that the user can close and reopen the app during training without losing progress.

---

## 15.6 Exercise Detail Flow

```text
User opens Exercise Detail
  ↓
App loads exercise info
  ↓
App loads latest set record
  ↓
App loads best weight
  ↓
App loads history grouped by workout date
  ↓
Screen renders summary and history list
```

### Queries Needed

- Last record for exercise
- Best weight for exercise
- History rows grouped by workout date

### Version 1 Progress Summary

Version 1 should show:

- Last workout record
- Best weight
- Exercise history by date

Charts and advanced volume analytics are not included in version 1.

---

## 15.7 Bodyweight Record Flow

```text
User enters bodyweight and date
  ↓
App validates input
  ↓
If date already exists:
  ask whether to update existing record
  ↓
Save body_records row
  ↓
Refresh bodyweight history
```

---

## 16. Exercise Management Rules

### Add Custom Exercise

```text
Validate name and muscle group
  ↓
Create exercises row with is_custom = 1
```

### Edit Custom Exercise

Only custom exercises should be editable in version 1.

```text
Check exercise.is_custom = 1
  ↓
Validate input
  ↓
Update exercise
```

### Delete or Archive Exercise

```text
User requests delete
  ↓
Check if exercise is used in workout_sets
  ↓
If not used:
  allow permanent delete
  ↓
If used:
  block delete and offer archive/hide
```

### Archive Behavior

```text
is_archived = 1
archived_at = now
```

Archived exercises should remain visible in old workout history but hidden from normal exercise selection by default.

---

## 17. Backup Export Design

### Export Trigger

The user taps **Export Data** in the Settings / Backup screen.

### Export Flow

```text
User taps Export Data
  ↓
App reads all data from SQLite
  ↓
App builds backup JSON object
  ↓
App writes JSON file locally
  ↓
App opens share/export sheet
```

### Backup File Structure

```json
{
  "app_name": "Gym Progress Tracker",
  "backup_version": 1,
  "exported_at": "2026-06-29T10:00:00Z",
  "data": {
    "exercises": [],
    "workouts": [],
    "workout_exercises": [],
    "workout_sets": [],
    "body_records": []
  }
}
```

### Design Note

The Requirement Document example includes `exercises`, `workouts`, `workout_sets`, and `body_records`. Because this system design adds `workout_exercises`, the export format should include it too.

This prevents losing the order of exercises inside a workout and supports exercise blocks that have no sets yet.

---

## 18. Backup Import Design

Version 1 uses replace-style import only.

### Import Flow

```text
User taps Import Data
  ↓
App recommends exporting current data first
  ↓
User selects JSON file
  ↓
App parses JSON
  ↓
App validates backup structure and data
  ↓
App shows destructive confirmation warning
  ↓
If user confirms:
    begin database transaction
      delete current local data
      insert backup data
      seed missing default exercises idempotently
    commit transaction
  ↓
Show success message
```

### Failure Flow

```text
Import starts
  ↓
Transaction begins
  ↓
Something fails
  ↓
Rollback transaction
  ↓
Previous local data remains unchanged
  ↓
Show error message
```

### Import Delete Order

When replacing current data, delete child records first:

```text
workout_sets
workout_exercises
body_records
workouts
exercises
```

### Import Insert Order

When inserting backup data, insert parent records first:

```text
exercises
workouts
workout_exercises
workout_sets
body_records
```

---

## 19. Backup Validation Rules

The backup validator should check:

### File-Level Validation

- File is valid JSON.
- `app_name` exists and equals `Gym Progress Tracker`.
- `backup_version` exists.
- `backup_version` is supported by the app.
- `exported_at` exists and is a valid ISO date/time.
- `data` object exists.

### Data Section Validation

Required arrays:

- `data.exercises`
- `data.workouts`
- `data.workout_exercises`
- `data.workout_sets`
- `data.body_records`

### Record Validation

The validator should check:

- Required fields exist.
- IDs are strings.
- IDs use the expected prefix where practical.
- Dates are valid strings.
- Weight values are valid numbers.
- Reps are positive integers.
- Workout status is either `in_progress` or `completed`.
- Foreign key references are valid.
- Duplicate IDs do not exist inside the backup.
- Unsupported backup versions are rejected.

### Import Safety Rule

The app must not delete current local data until the backup file has passed validation and the user confirms import.

---

## 20. Validation Strategy

Validation should happen in two layers:

1. **App/service validation** for user-friendly errors.
2. **SQLite constraints** for final data protection.

### Workout Validation

| Field | Rule |
|---|---|
| `workout_date` | Required |
| `status` | `in_progress` or `completed` |
| `completed_at` | Required only when status is completed |

### Exercise Validation

| Field | Rule |
|---|---|
| `name` | Required |
| `muscle_group` | Required |
| `equipment` | Optional |

### Set Validation

| Field | Rule |
|---|---|
| `weight` | Required, number, `>= 0` |
| `reps` | Required, whole number, `> 0` |
| `set_number` | Required, whole number, `> 0` |
| `notes` | Optional |

### Body Record Validation

| Field | Rule |
|---|---|
| `record_date` | Required |
| `body_weight` | Required, number, `> 0` |
| `notes` | Optional |

---

## 21. State Management Design

Version 1 does not need heavy global state management.

Recommended approach:

- Use local component state for form inputs.
- Use feature hooks for screen data loading.
- Use repository calls as the source of truth.
- Refresh screen data after successful writes.
- Avoid duplicating full database state in memory.

### Example

```text
StartWorkoutScreen
  ↓ uses
useActiveWorkout()
  ↓ calls
workoutService
  ↓ calls
workoutRepository
  ↓ reads/writes
SQLite
```

This is simpler and safer for an offline-first MVP.

---

## 22. Error Handling Design

### Error Categories

| Category | Example | UI Response |
|---|---|---|
| Validation error | Negative weight | Show field error |
| Database error | Insert failed | Show safe error message |
| Import validation error | Invalid backup file | Show import error and keep current data |
| Import transaction error | Insert failed during import | Rollback and show error |
| File error | Export failed | Show retry message |
| Migration error | Schema upgrade failed | Show blocking app error |

### User-Friendly Error Style

Errors should be clear but not overly technical.

Example:

```text
Cannot import this backup file. The file format is invalid or unsupported.
```

For development logs, keep more technical details in console/debug logs.

---

## 23. Privacy and Permissions Design

Version 1 should not collect or upload personal data.

### Privacy Rules

- No analytics.
- No ads.
- No external tracking.
- No account requirement.
- No automatic cloud upload.
- Workout and bodyweight data stays on device unless the user exports it.

### Permission Rules

The app should request only permissions needed for backup file import/export.

### Backup Privacy Warning

The backup file contains personal workout and bodyweight data. The app should remind the user to store exported files safely.

---

## 24. Fast Input UX Design

Because the app is used during workouts, speed matters more than visual complexity.

### Set Input Rules

- Weight and reps fields should be easy to tap.
- Add Set button should be large enough for gym usage.
- After adding a set, keep the user in the same exercise block.
- Auto-fill the next set weight from the previous set when practical.
- Clear or focus reps field after adding a set.
- Save immediately after tapping Add Set.

### Workout Screen Layout

Recommended order:

```text
Workout title/date
Add Exercise button
Exercise blocks
  Exercise name
  Previous/best summary if available
  Set list
  Weight input
  Reps input
  Add Set button
Finish Workout button
```

---

## 25. Query Design

### Latest Workout Summary

```sql
SELECT *
FROM workouts
WHERE status = 'completed'
ORDER BY workout_date DESC, completed_at DESC
LIMIT 1;
```

### Active Workout

```sql
SELECT *
FROM workouts
WHERE status = 'in_progress'
ORDER BY started_at DESC
LIMIT 1;
```

### Workout History

```sql
SELECT
  w.*,
  COUNT(DISTINCT ws.exercise_id) AS exercise_count,
  COUNT(ws.id) AS set_count
FROM workouts w
LEFT JOIN workout_sets ws ON ws.workout_id = w.id
WHERE w.status = 'completed'
GROUP BY w.id
ORDER BY w.workout_date DESC, w.completed_at DESC;
```

### Exercise Last Record

```sql
SELECT ws.*, w.workout_date
FROM workout_sets ws
JOIN workouts w ON w.id = ws.workout_id
WHERE ws.exercise_id = ?
ORDER BY w.workout_date DESC, ws.created_at DESC
LIMIT 1;
```

### Exercise Best Weight

```sql
SELECT MAX(weight) AS best_weight
FROM workout_sets
WHERE exercise_id = ?;
```

### Bodyweight History

```sql
SELECT *
FROM body_records
ORDER BY record_date DESC;
```

---

## 26. Build and Release Design

### Development Runtime

Expo Go may be used only for temporary early testing.

For serious testing, use:

```text
Expo development build
```

### Final Version 1 Runtime

Final user testing should use:

```text
Standalone Android APK
```

### Build Flow

```text
Develop app
  ↓
Test in development build
  ↓
Run TypeScript and app checks
  ↓
Build APK with EAS Build
  ↓
Install APK on Android phone
  ↓
Test during real gym session
```

---

## 27. Testing Strategy

### Unit Tests

Recommended unit test targets:

- ID generation
- Workout validation
- Exercise validation
- Set validation
- Body record validation
- Backup validation
- Backup version checking

### Repository Tests

Recommended repository test targets:

- Create workout
- Add exercise to workout
- Add set
- Edit set
- Delete set
- Complete workout
- Query workout history
- Query exercise history
- Archive used exercise
- Delete unused exercise

### Migration Tests

Recommended migration test targets:

- Fresh database creates all tables
- Running migrations twice does not break data
- Default exercise seed is idempotent
- Existing data survives migration

### Import/Export Tests

Recommended backup test targets:

- Export file contains all required sections
- Valid backup imports successfully
- Invalid JSON is rejected
- Unsupported backup version is rejected
- Duplicate IDs are rejected
- Broken foreign keys are rejected
- Failed import rolls back and keeps previous data

### Manual Real-Use Tests

Test during a real workout:

- Start workout quickly
- Add exercises quickly
- Add 3 sets for one exercise
- Close the app during workout
- Reopen and continue workout
- Finish workout
- View history
- View exercise detail
- Export backup
- Import backup safely

---

## 28. Risks and Tradeoffs

### Risk 1: Backup import can destroy current data

Replace-style import is simpler than merge import, but it is destructive.

Mitigation:

- Validate before import.
- Recommend export before import.
- Show confirmation warning.
- Use transaction-safe replacement.

### Risk 2: No account or cloud backup

The user can lose data if the phone is lost and no manual backup exists.

Mitigation:

- Make export easy to find.
- Remind user that backups must be stored safely.

### Risk 3: SQLite migration mistakes can damage valuable history

Workout history becomes important over time.

Mitigation:

- Use versioned migrations.
- Do not reset database automatically.
- Test migrations before real usage.

### Risk 4: Too much UI friction during workouts

If logging is slow, the app will not be used consistently.

Mitigation:

- Keep set input minimal.
- Auto-fill previous set weight.
- Use large buttons.
- Keep active workout flow simple.

### Risk 5: Added `workout_exercises` table increases schema complexity

The requirement data model did not include this table.

Mitigation:

- Keep it small and technical.
- Use it only for ordering and representing selected exercises before sets exist.
- Include it in backup export/import so data remains complete.

---

## 29. Implementation Order

Recommended implementation order:

1. Create Expo React Native TypeScript project.
2. Configure basic Android app metadata.
3. Create navigation shell.
4. Add SQLite database initialization.
5. Add migration runner.
6. Create initial schema migration.
7. Seed default exercises idempotently.
8. Build exercise list and exercise selection.
9. Build start workout flow.
10. Build add exercise to workout flow.
11. Build set input and immediate save.
12. Build continue unfinished workout behavior.
13. Build workout history.
14. Build workout detail.
15. Build exercise detail and simple progress summary.
16. Build bodyweight tracking.
17. Build exercise management, archive, and delete rules.
18. Build JSON export.
19. Build JSON import validation.
20. Build transaction-safe replace import.
21. Test with real workout data.
22. Build standalone Android APK.

---

## 30. Version 1 Design Summary

Gym Progress Tracker v1 should be built as a local-first Android mobile app using React Native, Expo, TypeScript, and SQLite.

The core architecture is intentionally simple:

```text
Screens → Hooks → Services → Repositories → SQLite
```

The most important design decisions are:

- Store all workout data locally in SQLite.
- Save every set immediately.
- Use stable local string IDs.
- Use versioned migrations.
- Seed default exercises idempotently.
- Add `workout_exercises` as a technical join table.
- Archive used exercises instead of deleting them.
- Export/import JSON backups manually.
- Validate backup files before import.
- Run replace-style import inside a database transaction.
- Build the final version as a standalone Android APK, not an Expo Go app.

This design keeps version 1 realistic, safe, and focused on actual gym usage.
