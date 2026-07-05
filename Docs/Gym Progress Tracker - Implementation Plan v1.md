# Gym Progress Tracker — Implementation Plan v1

**Document Status:** Draft v1  
**Source Documents:** Requirement Document, System Design, Database Design, UI Flow and Screen Design, Component Design  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Main Stack:** React Native, Expo, TypeScript, SQLite, JSON backup/import, EAS Build  
**Date:** 2026-07-05

---

## 1. Purpose

This document defines the practical implementation roadmap for **Gym Progress Tracker v1**.

The previous documents define what the app must do, how the system is structured, how the SQLite database protects data, how the screens behave, and how React Native components should manage state. This implementation plan converts those decisions into a coding sequence.

The goal is to build the app in a safe order:

```text
Foundation first
  ↓
Database and repositories
  ↓
Core workout logging
  ↓
History and progress review
  ↓
Bodyweight tracking
  ↓
Backup export/import
  ↓
Testing and APK build
```

This document is not a daily schedule. It is a phased build plan with deliverables, checkpoints, and testing gates.

---

## 2. Implementation Principles

## 2.1 Build database safety before UI polish

The most important app data is workout history. SQLite constraints, migrations, transactions, and repository behavior must be implemented before advanced UI polish.

Do not start with beautiful screens that write to temporary mock data for too long. The core app should connect to SQLite early.

## 2.2 Save workout sets immediately

Each set must be saved to SQLite immediately after the user taps **Add Set**.

Do not use delayed batching for workout logs.

```text
User taps Add Set
  ↓
Validate input
  ↓
Write through WorkoutWriteQueue
  ↓
SQLite transaction commits
  ↓
UI shows saved set
```

## 2.3 Keep active workout input fast

The active workout screen must avoid unnecessary full-screen re-renders.

Rules:

```text
Saved workout data: controller/store
Unsaved TextInput values: local component state
Block lock state: scoped by exercise block
Workout lock state: screen-level
```

## 2.4 Prefer simple vertical slices

Each phase should produce a working slice of the app. Avoid building many disconnected files that cannot run together.

Example of a good slice:

```text
Create workout → add exercise → add set → close app → reopen → continue workout
```

## 2.5 Test dangerous paths early

The risky paths are:

- Double-tap start workout.
- Double-tap add set.
- Rapid set insertion.
- Delete set and resequence.
- Bodyweight date collision.
- Backup import rollback.
- App close/reopen during active workout.

These should be tested before visual polish.

---

## 3. Recommended Branch Strategy

For a solo MVP, a simple branch strategy is enough.

```text
main
  Stable latest working version

develop
  Integration branch for active development

feature/*
  Short-lived feature branches
```

Recommended feature branches:

```text
feature/project-setup
feature/sqlite-foundation
feature/workout-core
feature/exercise-management
feature/history-progress
feature/body-records
feature/backup
feature/testing-apk
```

Rules:

- Keep feature branches small.
- Merge only after TypeScript and basic runtime checks pass.
- Do not mix major database changes with unrelated UI polish.
- Tag important working milestones if useful.

---

## 4. Phase Overview

| Phase | Goal | Main Output |
|---|---|---|
| Phase 0 | Prepare decisions and tooling | Clean project direction before coding |
| Phase 1 | Initialize project | Expo TypeScript app with navigation shell |
| Phase 2 | Build SQLite foundation | DB adapter, migrations, seed data |
| Phase 3 | Implement repositories and services | Safe data access layer |
| Phase 4 | Build active workout core | Start/continue workout, add exercise, add set |
| Phase 5 | Add active workout safety | Locks, queue, stale handling, timer, recovery |
| Phase 6 | Build exercise features | Exercise list, detail, custom exercise management |
| Phase 7 | Build workout history | History list and workout detail |
| Phase 8 | Build bodyweight tracking | Body records with collision handling |
| Phase 9 | Build backup export/import | JSON backup lifecycle and transaction-safe import |
| Phase 10 | Test, polish, and build APK | Real Android APK and validation |

---

# Phase 0 — Preparation

## 0.1 Goal

Confirm implementation direction before creating the codebase.

## 0.2 Tasks

- Confirm the current source documents are treated by role, not historical filename version.
- Confirm Android-only target for v1.
- Confirm kilograms-only unit system.
- Confirm no login, backend, cloud sync, analytics, ads, or external tracking.
- Confirm Expo will be used, but Expo Go is not the final runtime.
- Decide UI library strategy.
- Decide state management library or implementation style for selector-based active workout state.

## 0.3 Recommended technical choices

| Area | Recommendation | Reason |
|---|---|---|
| App framework | Expo + React Native + TypeScript | Matches v1 stack |
| Navigation | React Navigation or Expo Router | Either is acceptable; choose one and stay consistent |
| SQLite | `expo-sqlite` | Direct local database support |
| State management | Zustand or selector-based context store | Helps scoped subscriptions |
| Validation | Small custom validators first | Keeps MVP simple |
| Tests | Jest + React Native Testing Library | Component/unit testing |
| E2E/manual | Real Android phone testing | Required for gym usability |

## 0.4 Critical decision: state store

For the active workout screen, prefer one of these:

### Option A — Zustand

Recommended if you want simpler selector subscriptions.

```text
Pros:
- Simple selectors
- Less boilerplate
- Good for local app state

Cons:
- Adds external dependency
```

### Option B — Context + useSyncExternalStore

Recommended if you want fewer dependencies.

```text
Pros:
- More explicit
- No state library dependency

Cons:
- More implementation complexity
```

### Decision recommendation

Use **Zustand** for v1 unless you want to avoid extra dependencies completely.

Reason:

```text
The active workout screen needs scoped subscriptions.
Zustand makes this easier than a plain React Context value object.
```

## 0.5 Phase 0 done when

- State management choice is final.
- Navigation choice is final.
- Project can move into setup without architecture debate.

---

# Phase 1 — Project Setup

## 1.1 Goal

Create the React Native Expo TypeScript project and basic app shell.

## 1.2 Tasks

- Initialize Expo TypeScript project.
- Configure project name and app metadata.
- Add navigation structure.
- Add initial folder structure.
- Add shared UI components skeleton.
- Add lint/typecheck commands.
- Add basic app theme constants.
- Add Android build configuration baseline.

## 1.3 Suggested folder skeleton

```text
src/
  app/
    navigation/
  database/
    migrations/
    seeds/
  features/
    workouts/
    exercises/
    bodyRecords/
    backup/
  shared/
    components/
    utils/
    types/
```

## 1.4 Initial screens

Create placeholder screens only:

```text
HomeScreen
StartWorkoutScreen
ExerciseSelectionScreen
WorkoutHistoryScreen
WorkoutDetailScreen
ExerciseDetailScreen
ExerciseManagementScreen
BodyRecordScreen
SettingsBackupScreen
```

## 1.5 Shared components to stub

```text
AppButton
AppTextInput
ConfirmDialog
EmptyState
LoadingState
ErrorState
SnackbarHost
```

## 1.6 Test gate

Run:

```bash
npx tsc --noEmit
npm run lint
npx expo start
```

## 1.7 Phase 1 done when

- App launches successfully.
- Main tabs/navigation work.
- Placeholder screens are reachable.
- TypeScript passes.
- No database work is required yet.

---

# Phase 2 — SQLite Foundation

## 2.1 Goal

Build the database layer before feature logic depends on it.

## 2.2 Tasks

- Install and configure SQLite package.
- Create database open/init function.
- Enable foreign keys on startup.
- Create transaction helper.
- Create migration runner.
- Create `app_meta` schema version handling.
- Implement initial schema migration.
- Add idempotent default exercise seeding.
- Add database error mapping.

## 2.3 Files to create

```text
src/database/db.ts
src/database/transaction.ts
src/database/migrations/index.ts
src/database/migrations/001_initial_schema.ts
src/database/seeds/defaultExercises.ts
src/database/errors.ts
src/database/schemaVersion.ts
```

## 2.4 Initial schema must include

```text
exercises
workouts
workout_exercises
workout_sets
body_records
app_meta
```

## 2.5 Required constraints

Implement these from the start:

```text
UNIQUE partial index for one in_progress workout
UNIQUE(workout_id, exercise_order)
UNIQUE(workout_exercise_id, set_number)
UNIQUE(record_date)
CHECK(weight >= 0)
CHECK(reps > 0)
CHECK(body_weight > 0)
Foreign keys with cascade/restrict rules
```

## 2.6 Seed data

Seed default exercises with stable IDs:

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

Use `INSERT OR IGNORE`.

## 2.7 Test gate

Write or manually run checks for:

- Tables exist.
- Foreign keys are enabled.
- Default exercises seed once.
- Running initialization twice does not duplicate exercises.
- Two active workouts are rejected by SQLite.
- Duplicate body record date is rejected.

## 2.8 Phase 2 done when

- Fresh install creates schema correctly.
- Reopening app does not reset database.
- Default exercises are available.
- Core constraints are enforced.

---

# Phase 3 — Domain Types, Repositories, and Services

## 3.1 Goal

Create the data access and business logic layer before building full screens.

## 3.2 Domain types

Create shared domain types for:

```text
Exercise
Workout
WorkoutExercise
WorkoutSet
BodyRecord
BackupEnvelope
Result<T>
AppError
```

Recommended files:

```text
src/shared/types/result.ts
src/shared/types/errors.ts
src/features/workouts/types.ts
src/features/exercises/types.ts
src/features/bodyRecords/types.ts
src/features/backup/types.ts
```

## 3.3 Repository implementation order

Build repositories in this order:

1. ExerciseRepository
2. WorkoutRepository
3. WorkoutExerciseRepository
4. WorkoutSetRepository
5. BodyRecordRepository

Reason:

```text
Workout sets depend on workout exercise blocks.
Workout exercise blocks depend on workouts and exercises.
```

## 3.4 Required repository behavior

### WorkoutRepository

Must support:

```text
findActiveWorkout
createWorkout
getOrCreateActiveWorkout
completeWorkout
completeWorkoutWithTimestamp
deleteWorkout
findWorkoutHistory
findWorkoutDetail
```

`getOrCreateActiveWorkout()` must catch the single-active-workout unique constraint and return the existing active workout.

### WorkoutExerciseRepository

Must support:

```text
addExerciseBlock
findLatestExerciseBlock
addExerciseOrFocusLatest
addExerciseAsNewBlock
moveExerciseBlock
removeExerciseBlock
```

`moveExerciseBlock()` must use positive parking values inside a transaction.

### WorkoutSetRepository

Must support:

```text
addSet
updateSet
deleteSet
findSetsByWorkoutExercise
```

`addSet()` must calculate `MAX(set_number) + 1` inside the same transaction as insert.

`deleteSet()` must delete and resequence in one transaction using positive parking values.

### BodyRecordRepository

Must support:

```text
createBodyRecord
updateBodyRecord
replaceDateCollisionPreserveSourceId
deleteBodyRecord
findBodyRecordByDate
findBodyRecordHistory
findLatestBodyRecord
```

The collision replacement transaction must be:

```text
BEGIN TRANSACTION
  DELETE existing target-date record
  UPDATE source record to target date, bodyweight, and notes
COMMIT
```

## 3.5 Services/use cases

Create services after repositories:

```text
workoutService.ts
exerciseService.ts
bodyRecordService.ts
```

Services should coordinate repositories and return `Result<T>`.

## 3.6 Test gate

Required repository tests:

- Double start returns one active workout.
- Add exercise creates block.
- Selecting existing exercise focuses latest block by default.
- Add as new block creates repeated block.
- Rapid add set creates sequential set numbers.
- Delete set resequences visible set numbers.
- Move block uses safe transaction.
- Body date collision replacement preserves source ID.
- Used custom exercise cannot be permanently deleted.

## 3.7 Phase 3 done when

- Repositories work without UI.
- Dangerous database cases return controlled errors.
- Core transactions are tested.

---

# Phase 4 — Active Workout Core

## 4.1 Goal

Build the first useful vertical slice of the app:

```text
Start workout → add exercise → add set → close/reopen → continue workout
```

## 4.2 Tasks

- Implement Home active workout detection.
- Implement `getOrCreateActiveWorkout()` from Home.
- Implement Start / Continue Workout screen shell.
- Implement ActiveWorkoutControllerProvider/store.
- Implement exercise block list.
- Implement ExerciseSelectionScreen.
- Implement add exercise block flow.
- Implement set input form.
- Implement add set flow.
- Reload block from SQLite after save.

## 4.3 Active workout state store

Implement selector-based active workout store.

Required saved state:

```text
workout summary
workoutExerciseIds
workoutExercisesById
setsByWorkoutExerciseId
workoutWriteState
blockWriteStateById
isReloading
error
staleWriteRecovery
```

Required selectors:

```text
selectWorkoutSummary
selectWorkoutExerciseIds
selectExerciseBlock
selectSetsForBlock
selectBlockWriteState
selectHasAnyActiveBlockWrite
selectIsWorkoutScreenLocked
```

## 4.4 Components to implement

```text
StartWorkoutScreen
ActiveWorkoutControllerProvider
ActiveWorkoutContent
ExerciseBlockList
ExerciseBlockContainer
ExerciseBlockCard
ExerciseBlockHeader
SetRow
SetInputForm
WorkoutInfoCard
```

## 4.5 SetInputForm rules

`SetInputForm` must:

- Own `weightText`, `repsText`, and `notesText` locally.
- Validate locally before submit.
- Use local submit guard to prevent double-tap duplicate submission.
- Keep typed values if save fails.
- Clear/reset only after successful save.
- Never store draft text in StartWorkoutScreen.

## 4.6 Test gate

Manual tests:

- Start workout.
- Add one exercise.
- Add several sets.
- Close app and reopen.
- Continue active workout.
- Verify saved sets remain.
- Type quickly into weight and reps fields.

## 4.7 Phase 4 done when

- The app can record a real simple workout.
- Sets persist immediately.
- Active workout survives app restart.
- Text input feels responsive.

---

# Phase 5 — Active Workout Safety and UX Completion

## 5.1 Goal

Add the safety behavior required for production-like active workout use.

## 5.2 Tasks

- Implement `WorkoutWriteQueue`.
- Add block-level lock states.
- Add workout-level lock states.
- Add lock intersection rules.
- Add stuck-write recovery state.
- Add live workout timer.
- Add AppState-aware timer resume handling.
- Add timer cleanup and dependency-safe effect.
- Add stale workout detection.
- Add stale workout card on Home.
- Add discard workout flow.
- Add finish workout flow.
- Add stale finish timestamp logic.
- Add duplicate exercise snackbar.
- Add Add as New Block fallback.

## 5.3 WorkoutWriteQueue rules

The queue must:

```text
serialize immediate workout writes
execute each operation as soon as it reaches the front
wait for SQLite commit before resolving
not batch or delay writes
expose active operation status for recovery checks
```

## 5.4 Lock rules

Block-level writes:

```text
Add Set
Edit Set
Delete Set
Resequence sets
```

Workout-level writes:

```text
Finish Workout
Discard Workout
Add Exercise Block
Move Exercise Block
Delete Exercise Block
```

Intersection rule:

```text
If any block write is active:
  disable workout-level actions

If workout-level write is active:
  disable all block-level actions
```

## 5.5 Timer rules

`WorkoutTimer` must:

- Derive display from `Date.now() - startedAt`.
- Never write timer ticks to SQLite.
- Use AppState to recalculate on resume.
- Use effect dependencies, not an empty dependency array.
- Return early when `shouldRunTimer` is false.
- Clear interval in cleanup.
- Remove AppState listener in cleanup.
- Stop when stale, completed, hidden, or screen loses focus.

## 5.6 Stale workout rules

A workout is stale when:

```text
status = in_progress
AND started_at is older than 24 hours
```

If `set_count === 0`:

```text
Primary: Continue Workout
Secondary: Discard Workout
```

If `set_count > 0`:

```text
Primary: Finish Workout
Secondary: Continue Workout
Destructive: Discard Workout
```

Stale finish timestamp:

```text
If sets exist:
  completed_at = latest workout_set.created_at

If no sets exist:
  completed_at = workout.started_at
```

## 5.7 Test gate

Required tests:

- Rapid double tap Add Set creates one set only.
- Finish is disabled while add set is saving.
- Discard is disabled while add set is saving.
- Timer catches up after background/resume.
- Timer stops when workout becomes stale/completed.
- Stale workout with sets prioritizes Finish.
- Stale workout discard warning shows exact set count.
- Duplicate exercise selection jumps to latest block and shows snackbar.

## 5.8 Phase 5 done when

- Active workout screen behaves safely under rapid taps.
- Timer is accurate after background/resume.
- Stale workout cannot trap or silently lose user data.

---

# Phase 6 — Exercise Features

## 6.1 Goal

Build exercise browsing, progress access, and custom exercise management.

## 6.2 Tasks

- Implement Exercise List screen.
- Implement Exercise Selection search/filter.
- Implement muscle group filter chips.
- Implement Add Custom Exercise screen/form.
- Implement Edit Custom Exercise.
- Implement Exercise Management screen.
- Implement used-exercise delete protection.
- Implement archive used exercise.
- Hide archived exercises from normal selection by default.

## 6.3 Components

```text
ExerciseSearchBar
MuscleGroupFilterChips
ExerciseListItem
ExerciseManagementItem
ExerciseForm
```

## 6.4 Delete/archive behavior

```text
Default exercises:
  view-only in v1

Custom unused exercises:
  can be edited and deleted after confirmation

Custom used exercises:
  can be edited if safe
  cannot be permanently deleted
  can be archived/hidden
```

Usage check should rely on `workout_exercises`, not only `workout_sets`.

## 6.5 Test gate

- Default exercise list appears.
- Search works.
- Muscle group filter works.
- Custom exercise can be created.
- Custom unused exercise can be deleted after confirmation.
- Used exercise cannot be deleted.
- Used exercise can be archived.
- Archived exercise is hidden from normal selection.

## 6.6 Phase 6 done when

- Exercise list and custom exercise management are usable.
- Used workout history cannot be broken by exercise deletion.

---

# Phase 7 — Workout History and Exercise Progress

## 7.1 Goal

Let the user review completed workouts and exercise history.

## 7.2 Tasks

- Implement Workout History screen.
- Implement Workout Detail screen.
- Implement completed workout summaries.
- Implement Exercise Detail screen.
- Implement last record query.
- Implement best weight query.
- Implement exercise history by date.

## 7.3 Components

```text
WorkoutHistoryItem
WorkoutDetailHeader
WorkoutExerciseDetailCard
ReadOnlySetRow
ExerciseSummaryStatsCard
LastRecordCard
BestWeightCard
ExerciseHistoryList
ExerciseHistoryItem
```

## 7.4 Query rules

Workout history:

```text
completed workouts only
newest first
include exercise_count and set_count
```

Exercise history:

```text
completed workouts only
ordered newest first
preserve exercise block order and set number
```

## 7.5 Test gate

- Completed workout appears in history.
- In-progress workout does not appear as completed history.
- Workout detail shows exercise blocks in order.
- Repeated exercise blocks appear separately.
- Exercise detail shows last record.
- Exercise detail shows best weight.
- Empty exercise history has readable empty state.

## 7.6 Phase 7 done when

- User can answer: “What did I do last time?”
- User can answer: “What weight did I use for this exercise?”

---

# Phase 8 — Bodyweight Tracking

## 8.1 Goal

Build bodyweight add/edit/delete/history with one-record-per-date integrity.

## 8.2 Tasks

- Implement Body Record screen.
- Implement BodyRecordForm.
- Implement bodyweight history list.
- Implement latest bodyweight summary.
- Implement add same-date collision flow.
- Implement edit date collision flow.
- Implement delete body record confirmation.

## 8.3 Same-date add behavior

```text
User adds bodyweight for existing date
  ↓
Show confirmation
  ↓
If confirmed, update existing record
```

## 8.4 Edit-date collision behavior

If user edits a record date to a date that already exists:

```text
Show confirmation:
A bodyweight record already exists for this date.
Replace it with this edited record?
```

If confirmed:

```text
BEGIN TRANSACTION
  DELETE existing target-date record
  UPDATE source record to target date, bodyweight, and notes
COMMIT
```

Rollback on failure.

## 8.5 Test gate

- Add bodyweight record.
- Add same date asks to update existing.
- Edit bodyweight without changing date updates normally.
- Edit date to unused date updates normally.
- Edit date to existing date shows confirmation.
- Confirm collision replacement preserves source ID.
- Failed collision transaction keeps both original records unchanged.
- Delete body record asks confirmation.

## 8.6 Phase 8 done when

- Bodyweight feature is complete and cannot violate `UNIQUE(record_date)` through normal UI.

---

# Phase 9 — Backup Export and Import

## 9.1 Goal

Protect local data through JSON export/import backup.

## 9.2 Tasks

- Implement backup types.
- Implement backup export service.
- Implement backup envelope builder.
- Implement backup file writing/sharing.
- Implement backup import file picker.
- Implement JSON parser.
- Implement backup envelope validator.
- Implement backup data validator.
- Implement backup transformer chain structure.
- Add historical backup fixtures.
- Implement replace-style import transaction.
- Implement import confirmation UI.
- Implement readable import failure messages.

## 9.3 Backup envelope

Required fields:

```text
app_name
backup_version
app_schema_version
exported_at
exported_app_version optional
data
```

Required data sections:

```text
exercises
workouts
workout_exercises
workout_sets
body_records
```

## 9.4 Import flow

```text
Select JSON file
  ↓
Parse JSON
  ↓
Validate envelope
  ↓
Check backup_version
  ↓
Transform if older and supported
  ↓
Validate transformed data
  ↓
Show destructive confirmation
  ↓
Replace local data inside one transaction
  ↓
Commit or rollback
```

## 9.5 Replace transaction order

```text
BEGIN TRANSACTION
  DELETE workout_sets
  DELETE workout_exercises
  DELETE workouts
  DELETE body_records
  DELETE exercises

  INSERT exercises
  INSERT workouts
  INSERT workout_exercises
  INSERT workout_sets
  INSERT body_records
COMMIT
```

If any insert fails:

```text
ROLLBACK
Previous local data remains unchanged
```

## 9.6 Required fixtures

```text
src/features/backup/fixtures/backup-v1-valid.json
src/features/backup/fixtures/backup-v1-invalid-multiple-active-workouts.json
```

## 9.7 Test gate

- Export creates valid JSON.
- Export includes all required sections.
- Import rejects invalid JSON.
- Import rejects wrong app name.
- Import rejects newer backup version.
- Import rejects multiple active workouts.
- Import rejects missing referenced IDs.
- Import rollback preserves current data after failure.
- Fresh install can import valid backup.

## 9.8 Phase 9 done when

- User can export a backup.
- User can import a valid backup.
- Invalid import cannot partially replace local data.

---

# Phase 10 — Testing, Polish, and APK Build

## 10.1 Goal

Prepare the MVP for real Android phone usage.

## 10.2 Functional testing checklist

### Workout tracking

- Create workout.
- Continue unfinished workout.
- Add exercise.
- Select duplicate exercise.
- Add as new block.
- Add set.
- Edit set.
- Delete set.
- Finish workout.
- Discard workout.
- Handle stale workout.

### Exercise features

- Browse exercises.
- Filter by muscle group.
- Add custom exercise.
- Edit custom exercise.
- Delete unused custom exercise.
- Archive used exercise.
- View exercise history.

### Bodyweight

- Add bodyweight.
- Edit bodyweight.
- Delete bodyweight.
- Same-date add collision.
- Edit-date collision.

### Backup

- Export backup.
- Import backup.
- Reject invalid backup.
- Confirm replace import.
- Rollback failed import.

## 10.3 Performance testing checklist

Test on real Android phone:

- Type quickly in weight/reps.
- Add many sets quickly.
- Scroll through multiple exercise blocks.
- Background app and return during workout.
- Close and reopen app during active workout.
- Check timer after resume.
- Check set persistence after app restart.

## 10.4 Safety testing checklist

- Rapid double tap Start Workout.
- Rapid double tap Add Set.
- Finish while set save is pending.
- Discard while set save is pending.
- Delete set and verify compact set numbers.
- Move block if implemented.
- Backup import failure does not destroy existing data.

## 10.5 APK build tasks

- Configure EAS project.
- Configure Android package name.
- Configure app icon and splash screen.
- Build development APK if needed.
- Build final standalone APK.
- Install APK on Android phone.
- Test without Expo Go.

## 10.6 Final acceptance gate

The MVP is ready when:

```text
User can create workout
User can add exercises
User can record sets quickly
Sets are saved immediately
User can close app and continue workout later
User can view workout history
User can view exercise history
User can record bodyweight
User can export backup
User can import valid backup
Invalid import cannot damage existing data
App works offline
App runs as standalone Android APK
```

---

## 11. Suggested Build Order Summary

Use this as the practical coding order:

```text
1. Project setup and navigation shell
2. SQLite adapter and migration runner
3. Initial schema and default exercise seed
4. Domain types and Result/AppError utilities
5. ExerciseRepository
6. WorkoutRepository
7. WorkoutExerciseRepository
8. WorkoutSetRepository
9. BodyRecordRepository
10. WorkoutWriteQueue
11. Home active workout detection
12. Start / Continue Workout screen
13. Add exercise block flow
14. Add set flow with local input isolation
15. Block/workout write locks
16. Timer, AppState handling, and stale workout UI
17. Edit/delete set flows
18. Workout finish/discard flows
19. Exercise list and custom exercise management
20. Workout history and detail
21. Exercise detail progress
22. Bodyweight tracking
23. Backup export
24. Backup import
25. Automated tests
26. Real phone testing
27. Standalone APK build
```

---

## 12. What Not to Build in v1

Do not add these during v1 implementation unless the MVP is already stable:

```text
Login/register
Cloud sync
Backend API
AI workout coach
Nutrition tracking
Social features
Advanced analytics
Charts system
Workout templates
Rest timer
Insert Set Above
Drag-and-drop exercise ordering
Multi-unit kg/lb switching
Progress photos
Waist measurements
```

Reason:

```text
The v1 goal is a stable offline-first tracker for real gym usage.
More features can be added after the core data model and backup safety are proven.
```

---

## 13. Implementation Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Input lag on active workout screen | Bad gym usability | Local TextInput state and selector-based store |
| Duplicate set writes from double tap | Duplicate data or constraint error | Local submit guard + block lock + write queue |
| Duplicate active workouts | Broken continue flow | SQLite partial unique index + repository fallback |
| Set number collision | Failed add set | Queue + transaction + unique constraint |
| Reorder constraint collision | Failed move block | Positive parking transaction |
| Set deletion gaps | Confusing workout history | Delete/resequence transaction |
| Bodyweight date collision | SQLite unique error | Explicit collision dialog and transaction |
| Timer drift after backgrounding | Wrong user trust | Date-derived timer + AppState resume recalculation |
| Timer memory leaks | Battery/performance drain | Effect cleanup and dependency-safe lifecycle |
| Backup import data loss | Severe data loss | Validate before import + transaction rollback |
| Scope creep | MVP delay | Keep future features out of v1 |

---

## 14. Recommended First Coding Session

Start with Phase 1 and the beginning of Phase 2.

First coding session target:

```text
Create Expo TypeScript project
Set up folder structure
Set up navigation shell
Create placeholder screens
Add shared basic components
Install SQLite package
Create database open/init file
```

Do not implement the full active workout screen before the database foundation exists.

---

## 15. Implementation Plan Summary

The implementation should begin with infrastructure, not UI polish.

The safest path is:

```text
Project shell
  ↓
SQLite foundation
  ↓
Repositories and transactions
  ↓
Active workout vertical slice
  ↓
Safety and lifecycle behavior
  ↓
History/bodyweight/backup
  ↓
APK testing
```

This order protects the most valuable data first: workout sets, workout history, bodyweight records, and backups.

Once this implementation plan is accepted, the next useful artifact is either:

1. **Coding Checklist v1** — a granular task checklist for GitHub issues or manual tracking.
2. **Daily Build Schedule v1** — a calendar-style plan for implementing the MVP over a fixed number of days or weeks.
