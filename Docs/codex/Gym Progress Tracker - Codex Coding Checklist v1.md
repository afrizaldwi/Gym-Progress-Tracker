# Gym Progress Tracker — Codex Coding Checklist v1

**Document Status:** Draft v1  
**Source Documents:** Requirement Document, PRD and Codex Project Brief, System Design, Database Design, UI Flow and Screen Design, Component Design, Implementation Plan, UI Style Guide and Theme Tokens  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Purpose:** Step-by-step coding checklist and prompt plan for Codex-assisted implementation  
**Date:** 2026-07-05

---

## 1. Purpose

This document turns the approved Gym Progress Tracker design documents into a practical coding checklist for Codex-assisted development.

The goal is not to ask Codex to build the whole app in one step. The goal is to give Codex small, reviewable tasks with strict acceptance checks.

Use this document together with:

```text
Gym Progress Tracker — PRD and Codex Project Brief v1
Gym Progress Tracker — Implementation Plan v1
Gym Progress Tracker — UI Style Guide and Theme Tokens v1
Gym Progress Tracker — Requirement Document v1
Gym Progress Tracker — System Design
Gym Progress Tracker — Database Design
Gym Progress Tracker — UI Flow and Screen Design
Gym Progress Tracker — Component Design
```

## Implementation Focus

This checklist adds the finalized UI styling decision before implementation starts:

1. Use the **Warm Iron Light** theme from the UI Style Guide and Theme Tokens document.
2. Use React Native `StyleSheet` plus centralized `theme.ts` tokens for v1.
3. Do not use Tailwind, NativeWind, or utility-class styling in v1 unless the project owner explicitly reopens this decision.
4. Do not hardcode colors inside feature components.
5. Create shared theme primitives before feature UI implementation.

---

## 2. How to Use This Checklist

Recommended workflow for every Codex task:

```text
1. Start a new Codex task or thread for one focused feature.
2. Paste the relevant prompt from this checklist.
3. Include the current design documents or point Codex to their paths in the repository.
4. Ask Codex to inspect existing files first.
5. Ask Codex to modify only the necessary files.
6. Ask Codex to explain the diff.
7. Run tests/typecheck/lint.
8. Review the diff manually before accepting.
9. Commit only after the task passes its gate.
```

Do not combine unrelated tasks. For example, do not ask Codex to implement SQLite, navigation, active workout UI, and backup import in one request.

---

## 3. Global Codex Guardrails

Paste these guardrails at the top of major Codex tasks.

```text
You are implementing Gym Progress Tracker v1.

Follow the existing project documents strictly:
- Requirement Document
- PRD and Codex Project Brief
- System Design
- Database Design
- UI Flow and Screen Design
- Component Design
- Implementation Plan

Do not redesign the app.
Do not add features outside v1.
Do not add login, backend, cloud sync, AI, nutrition, social features, analytics, ads, or automatic cloud upload.
Do not change the SQLite schema unless this task explicitly asks for it.
Do not batch workout set writes in memory.
Do not show a set as saved before SQLite confirms the insert.
Do not remove transaction safety.
Do not replace local TextInput state with global parent state.
Do not ignore the two-tier active workout locking model.
Do not change the backup JSON format unless validators, transformers, and fixtures are updated in the same task.
Do not use Tailwind, NativeWind, CSS utility classes, or UI styling frameworks in v1.
Do not hardcode colors inside feature components. Use shared theme tokens from src/shared/theme/theme.ts.
Do not introduce blue as the primary color.
Do not use pure white #FFFFFF for surfaces or pure black #000000 for text.

Keep the implementation offline-first, Android-first, TypeScript-first, SQLite-backed, and aligned with the Warm Iron Light theme.
```

---

## 4. Task Format to Use With Codex

For each task, use this structure:

```text
Task: <small task name>

Context:
<brief design context>

Files to inspect first:
<file or folder list>

Implementation requirements:
<strict requirements>

Do not:
<explicit boundaries>

Acceptance checks:
<commands/tests/manual checks>

Output expected:
- Summary of changes
- Files changed
- Tests run
- Any risks or follow-up tasks
```

This keeps Codex focused and makes the diff easier to review.

---

## 5. Phase 0 — Repository and Project Setup

### 5.1 Goal

Create the base Expo React Native TypeScript project structure and install only the core dependencies needed for the MVP.

### 5.2 Codex Prompt: Initialize Project Structure

```text
Task: Initialize Gym Progress Tracker project structure

Context:
This is an offline-first Android mobile app built with React Native, Expo, TypeScript, SQLite, and JSON export/import backup. Version 1 must run as a standalone Android APK and must not depend on Expo Go as the final runtime.

Files to inspect first:
- package.json, if it exists
- app.json or app.config.ts, if it exists
- src/ folder, if it exists

Implementation requirements:
1. Set up or normalize the Expo TypeScript project structure.
2. Create the top-level source folders:
   - src/app/navigation
   - src/database
   - src/features/workouts
   - src/features/exercises
   - src/features/bodyRecords
   - src/features/backup
   - src/shared/components
   - src/shared/theme
   - src/shared/utils
3. Add placeholder index files only when useful.
4. Do not implement feature logic yet.
5. Create the shared theme foundation from the UI Style Guide:
   - src/shared/theme/theme.ts
   - src/shared/theme/index.ts
6. Implement Warm Iron Light tokens exactly:
   - background #FAF7F2
   - surface #FFFCF7
   - textPrimary #1C1917
   - primary #B45309
   - surfaceMuted #F3EDE4
   - border #E7DED3
   - textSecondary #57534E
   - textMuted #78716C
   - success #16A34A
   - danger #DC2626
   - warning #D97706
7. Keep the setup minimal and aligned with the approved design documents.

Do not:
- Add backend code.
- Add auth libraries.
- Add analytics/tracking packages.
- Add UI libraries unless explicitly justified.
- Add Tailwind, NativeWind, Tamagui, styled-components, or other styling frameworks in v1.
- Use pure white #FFFFFF or pure black #000000 in theme tokens.

Acceptance checks:
- Project installs successfully.
- TypeScript config exists and is valid.
- App can start to a placeholder screen.

Output expected:
- Summary of folders/files created
- Any package changes
- Commands to run next
```

### 5.3 Gate

Do not proceed until:

```text
npm install succeeds
npx tsc --noEmit succeeds, or there is a clear known setup-only issue
Expo app can open a placeholder screen
```

---

## 6. Phase 1 — Shared Theme and Base Components

### 6.1 Goal

Create the shared theme and base UI primitives before navigation and feature screens so the app does not drift into hardcoded styles.

### 6.2 Codex Prompt: Implement Theme Tokens and Base UI Components

```text
Task: Implement Warm Iron Light theme tokens and base UI components

Context:
The app uses the UI Style Guide and Theme Tokens document. The design direction is a light, warm, minimal interface. Version 1 must use React Native StyleSheet plus centralized theme tokens. Do not use Tailwind, NativeWind, or utility-class styling.

Files to inspect first:
- src/shared/theme, if it exists
- src/shared/components, if it exists
- UI Style Guide and Theme Tokens document

Implementation requirements:
1. Create or update src/shared/theme/theme.ts with Warm Iron Light tokens.
2. Export theme tokens from src/shared/theme/index.ts.
3. Define color, spacing, radius, typography, and shadow/elevation tokens.
4. Create base components if not present:
   - AppButton
   - AppTextInput
   - AppCard
5. Components must use StyleSheet.create and theme tokens.
6. Button variants must include primary, secondary, danger, ghost.
7. Do not hardcode colors inside these components except by referencing theme tokens.

Do not:
- Add Tailwind or NativeWind.
- Use className for styling.
- Use #FFFFFF as surface.
- Use #000000 as textPrimary.
- Add decorative colors beyond the theme/status tokens.

Acceptance checks:
- TypeScript passes.
- Base components render without database dependencies.
- Components import theme tokens from shared theme.
- No new styling framework dependencies are added.

Output expected:
- Summary of theme files created
- Summary of base components created
- Any styling assumptions
```

### 6.3 Gate

Do not proceed until:

```text
Theme tokens exist in src/shared/theme/theme.ts
Base shared components use theme tokens
No Tailwind/NativeWind dependency exists
No feature component contains hardcoded project colors
```

---

## 7. Phase 2 — Navigation Shell

### 6.1 Goal

Create the basic mobile navigation structure before implementing business logic.

### 6.2 Codex Prompt: Add Navigation Shell

```text
Task: Implement navigation shell

Context:
The app uses bottom tabs for Home, Workouts, Exercises, Body, and Settings. Nested screens include Start Workout, Exercise Selection, Workout Detail, Exercise Detail, Exercise Management, and backup/import screens.

Files to inspect first:
- src/app/navigation
- app entry file
- package.json

Implementation requirements:
1. Add the navigation shell using the chosen React Native navigation setup already present in the project.
2. Create placeholder screens for:
   - HomeScreen
   - StartWorkoutScreen
   - ExerciseSelectionScreen
   - WorkoutHistoryScreen
   - WorkoutDetailScreen
   - ExerciseListScreen or ExerciseManagementScreen
   - ExerciseDetailScreen
   - BodyRecordScreen
   - SettingsBackupScreen
3. Configure bottom tabs:
   - Home
   - Workouts
   - Exercises
   - Body
   - Settings
4. Keep placeholder UI simple.
5. Do not implement database reads yet.

Do not:
- Add feature business logic.
- Add fake persistent data beyond temporary placeholders.
- Change the app scope.

Acceptance checks:
- App opens successfully.
- User can navigate between all main tabs.
- Placeholder nested screens can be reached where practical.
- TypeScript passes.

Output expected:
- Navigation structure summary
- Files changed
- Tests/typecheck run
```

### 6.3 Gate

```text
npx tsc --noEmit
Manual navigation smoke test
```

---

## 8. Phase 3 — SQLite Foundation

### 7.1 Goal

Build the database adapter, transaction helper, migration runner, and default exercise seed structure.

### 7.2 Codex Prompt: SQLite Adapter and Transaction Helper

```text
Task: Implement SQLite adapter and transaction helper

Context:
Gym Progress Tracker v1 is offline-first. SQLite is the source of truth. The app must use versioned migrations and transaction-safe writes.

Files to inspect first:
- src/database
- package.json
- System Design
- Database Design

Implementation requirements:
1. Implement a SQLite database open/init module.
2. Ensure foreign keys are enabled on database open with PRAGMA foreign_keys = ON.
3. Implement a transaction helper that supports explicit transaction execution.
4. Add a controlled database error type or mapper.
5. Keep all direct SQL access inside database/repository layers.

Do not:
- Execute feature-specific SQL from UI components.
- Reset the database automatically during normal startup.
- Hide raw errors without preserving enough debugging context for development logs.

Acceptance checks:
- Database opens successfully.
- Foreign keys are enabled.
- Transaction helper can commit and rollback a simple test transaction.
- TypeScript passes.

Output expected:
- Summary of database foundation
- Files changed
- Suggested tests added or needed
```

### 7.3 Codex Prompt: Initial Migration

```text
Task: Implement initial SQLite migration

Context:
The Database Design defines the final v1 schema. Main tables are exercises, workouts, workout_exercises, workout_sets, body_records, and app_meta.

Files to inspect first:
- src/database/migrations
- Database Design

Implementation requirements:
1. Create migration 001_initial_schema.
2. Create all required tables:
   - exercises
   - workouts
   - workout_exercises
   - workout_sets
   - body_records
   - app_meta
3. Add all required CHECK constraints, foreign keys, unique constraints, and indexes.
4. Add partial unique index for one in_progress workout.
5. Restore UNIQUE(record_date) for body_records.
6. Add app_meta db_schema_version.
7. Make the migration idempotent where appropriate.

Do not:
- Use auto-increment IDs for main entities.
- Remove workout_exercises.
- Add UNIQUE(workout_id, exercise_id).
- Remove UNIQUE(workout_id, exercise_order).
- Remove UNIQUE(workout_exercise_id, set_number).

Acceptance checks:
- Fresh migration succeeds.
- Re-running startup does not duplicate schema or crash.
- TypeScript passes.

Output expected:
- Summary of schema implemented
- Any differences from Database Design, if unavoidable
- Tests or manual SQL checks
```

### 7.4 Codex Prompt: Default Exercise Seed

```text
Task: Implement idempotent default exercise seed

Context:
The app must include beginner-friendly default exercises with stable IDs. Seeding must be idempotent so migrations or app restarts do not create duplicates.

Files to inspect first:
- src/database/seeds
- Database Design default exercise seed section
- Requirement Document exercise examples

Implementation requirements:
1. Add default exercise seed list with stable IDs.
2. Seed using INSERT OR IGNORE or equivalent idempotent behavior.
3. Include at least:
   - Chest Press Machine
   - Lat Pulldown
   - Seated Row
   - Leg Press
   - Shoulder Press Machine
   - Lateral Raise
   - Bicep Curl
   - Tricep Pushdown
   - Leg Extension
   - Leg Curl
4. Preserve kg-only design; no unit field needed for v1.

Do not:
- Generate random IDs for default exercises.
- Duplicate default exercises on app restart.

Acceptance checks:
- Fresh install seeds default exercises once.
- Re-running seed keeps one copy per stable ID.
- TypeScript passes.
```

### 7.5 Gate

```text
Fresh app startup creates schema
Foreign keys enabled
Default exercises seeded once
TypeScript passes
```

---

## 9. Phase 4 — Shared Types, Validators, and Result Pattern

### 8.1 Goal

Create shared domain types, validation helpers, and controlled result/error patterns before writing repositories.

### 8.2 Codex Prompt: Domain Types and Result Pattern

```text
Task: Implement shared domain types and Result pattern

Context:
Repositories should return controlled results and not leak raw SQLite errors into UI. Main records use stable string IDs.

Files to inspect first:
- src/shared/utils
- src/features/*/types.ts
- System Design repository error handling section
- Database Design table definitions

Implementation requirements:
1. Add Result<T> type:
   - { ok: true; data: T }
   - { ok: false; error: AppError }
2. Add AppError type/categories suitable for:
   - validation
   - database
   - constraint
   - notFound
   - importValidation
   - unknown
3. Add domain types for Exercise, Workout, WorkoutExercise, WorkoutSet, BodyRecord.
4. Add ID generation helper for stable prefixed IDs.
5. Add date utilities for ISO datetime and date-only strings.

Do not:
- Use numeric auto-increment IDs for main domain models.
- Throw raw SQLite errors directly to UI layers.

Acceptance checks:
- Types compile.
- Simple unit tests for ID/date utilities if test framework exists.
```

### 8.3 Codex Prompt: Validators

```text
Task: Implement MVP validators

Context:
Validation must prevent invalid input before repository writes. SQLite remains the final guard, but UI should show friendly messages.

Files to inspect first:
- src/features/workouts/validators.ts
- src/features/exercises/validators.ts
- src/features/bodyRecords/validators.ts
- Requirement Document validation rules
- Database Design validation rules

Implementation requirements:
1. Add validators for:
   - exercise name and muscle group
   - set weight and reps
   - workout date/status rules
   - bodyweight record date/bodyweight
2. Weight must be >= 0.
3. Bodyweight must be > 0.
4. Reps must be a whole number > 0.
5. App uses kg only.
6. Return friendly validation errors.

Do not:
- Add pounds/unit conversion.
- Add RPE/rest timer fields.
- Add nutrition fields.

Acceptance checks:
- Validator tests pass if tests exist.
- TypeScript passes.
```

### 8.4 Gate

```text
Types compile
Validators match Requirement Document and Database Design
No feature creep fields added
```

---

## 10. Phase 5 — Repository Layer

### 9.1 Goal

Implement repositories before UI so the app has a reliable local data foundation.

---

### 9.2 Codex Prompt: Workout Repository

```text
Task: Implement WorkoutRepository

Context:
The app allows only one in_progress workout. SQLite enforces this with a partial unique index. Repository must handle double-tap start safely.

Files to inspect first:
- src/features/workouts/repositories
- src/database
- Database Design Workout repository section
- System Design Start Workout Flow

Implementation requirements:
1. Implement:
   - findActiveWorkout()
   - createWorkout()
   - getOrCreateActiveWorkout()
   - completeWorkout()
   - updateWorkout()
   - deleteWorkout()
   - findWorkoutHistory()
   - findWorkoutDetail()
2. getOrCreateActiveWorkout must:
   - query existing in_progress workout first
   - try insert only if none exists
   - catch unique active workout constraint
   - return the existing active workout instead of crashing
3. completeWorkout must respect completed_at rules.
4. deleteWorkout must rely on cascade delete for blocks/sets.

Do not:
- Allow more than one in_progress workout.
- Expose raw SQLite errors to UI.
- Delete database on error.

Acceptance checks:
- Creating first workout succeeds.
- Double create returns one active workout.
- Completing workout clears active state.
- History returns completed workouts newest first.
```

---

### 9.3 Codex Prompt: WorkoutExerciseRepository

```text
Task: Implement WorkoutExerciseRepository

Context:
Workout exercises represent exercise blocks inside one workout. Repeated exercises are allowed. Exercise order is unique inside one workout.

Files to inspect first:
- src/features/workouts/repositories
- Database Design workout_exercises section
- System Design repeated exercise and reorder sections

Implementation requirements:
1. Implement:
   - addExerciseBlock()
   - findLatestExerciseBlock(workoutId, exerciseId)
   - addExerciseOrFocusLatest()
   - addExerciseAsNewBlock()
   - moveExerciseBlock()
   - removeExerciseBlock()
2. Do not enforce UNIQUE(workout_id, exercise_id).
3. addExerciseOrFocusLatest should focus latest existing block by default.
4. addExerciseAsNewBlock should append a new block with next exercise_order.
5. moveExerciseBlock must use positive parking values inside one transaction.
6. Final exercise_order values must be compact positive integers.

Do not:
- Directly swap order values without parking.
- Use negative parking values.
- Block repeated exercise blocks.

Acceptance checks:
- Same exercise can appear twice in one workout.
- Focus-latest flow works.
- Add-as-new-block flow works.
- Move Up/Down does not violate unique order constraint.
- Failed reorder rolls back old order.
```

---

### 9.4 Codex Prompt: WorkoutSetRepository

```text
Task: Implement WorkoutSetRepository

Context:
Set logging must be immediate and transaction-safe. Set numbers are unique inside one workout exercise block and must stay compact after deletion.

Files to inspect first:
- src/features/workouts/repositories
- src/database/transaction.ts
- Database Design workout_sets section
- System Design Add Set and Delete Set sections

Implementation requirements:
1. Implement:
   - addSet()
   - updateSet()
   - deleteSet()
   - findSetsByWorkoutExercise()
2. addSet must calculate next set_number inside the same transaction as INSERT.
3. addSet must not show or return success before commit.
4. updateSet must not normally change set_number.
5. deleteSet must delete and resequence remaining sets inside one transaction.
6. Resequencing must use positive parking values to avoid UNIQUE collisions.
7. Final set_number values must be compact: 1, 2, 3, ...

Do not:
- Calculate MAX(set_number)+1 outside the transaction.
- Batch sets in JS memory for later persistence.
- Leave visible gaps after delete.
- Use negative temporary set numbers.

Acceptance checks:
- Rapid add set calls produce sequential set numbers.
- Delete Set 2 from 1,2,3 produces 1,2.
- Failed delete/resequence rolls back correctly.
- Constraint errors return controlled errors.
```

---

### 9.5 Codex Prompt: ExerciseRepository

```text
Task: Implement ExerciseRepository

Context:
Exercises include default and custom exercises. Used exercises must not be permanently deleted; they should be archived instead.

Files to inspect first:
- src/features/exercises/repositories
- Database Design Exercise repository section
- Requirement Document exercise management requirements

Implementation requirements:
1. Implement:
   - findAllActiveExercises()
   - findExercisesByMuscleGroup()
   - createCustomExercise()
   - updateCustomExercise()
   - deleteUnusedCustomExercise()
   - archiveUsedExercise()
   - hasWorkoutHistory()
2. hasWorkoutHistory must check workout_exercises, not workout_sets.
3. Default exercises are not editable in v1.
4. Used exercises must be archived or hidden, not permanently deleted.

Do not:
- Delete exercises referenced by workout_exercises.
- Make default exercises editable.
- Remove old history when archiving.

Acceptance checks:
- Default exercises appear.
- Custom exercise can be created/edited.
- Unused custom exercise can be deleted.
- Used exercise delete is blocked and archive works.
```

---

### 9.6 Codex Prompt: BodyRecordRepository

```text
Task: Implement BodyRecordRepository

Context:
The app allows one bodyweight record per date. Add and edit flows must handle same-date collisions explicitly.

Files to inspect first:
- src/features/bodyRecords/repositories
- Database Design body_records section
- UI Flow Body Record sections

Implementation requirements:
1. Implement:
   - createBodyRecord()
   - updateBodyRecord()
   - deleteBodyRecord()
   - findBodyRecordHistory()
   - findLatestBodyRecord()
   - findBodyRecordByDate()
   - replaceTargetDateWithSourceRecordEdit()
2. createBodyRecord should return a controlled duplicate-date result/error if date exists.
3. updateBodyRecord should detect date changes.
4. Edit-date collision replacement must use exact transaction order:
   BEGIN TRANSACTION
     DELETE existing target-date record
     UPDATE source record to target date, body_weight, and notes
   COMMIT
5. Preserve the edited/source record ID during replacement.
6. Rollback must keep both original records unchanged.

Do not:
- Update source record date before deleting target date record.
- Silently overwrite same-date body record without user confirmation.
- Expose SQLITE_CONSTRAINT_UNIQUE to UI.

Acceptance checks:
- Duplicate create is detected.
- Edit date to unused date succeeds.
- Edit date to existing date requires replacement path.
- Replacement preserves source ID and deletes target ID.
- Failed replacement rolls back.
```

### 9.7 Gate

```text
Repository tests pass
Schema constraints verified
No UI depends on fake persistence
```

---

## 11. Phase 6 — WorkoutWriteQueue and Services

### 10.1 Goal

Add the concurrency control layer before the active workout UI.

### 10.2 Codex Prompt: WorkoutWriteQueue

```text
Task: Implement WorkoutWriteQueue

Context:
WorkoutWriteQueue serializes immediate workout write promises. It is not a delayed batching system. Each operation must execute against SQLite when it reaches the front of the queue.

Files to inspect first:
- src/database/writeQueue.ts
- System Design Workout Write Concurrency Strategy
- Database Design Write Queue Design

Implementation requirements:
1. Implement a queue that serializes async write operations.
2. Track whether an operation is active.
3. Expose status for stuck-write recovery checks.
4. Execute each write immediately when it reaches the front.
5. Resolve/reject based on the underlying repository operation.

Do not:
- Batch set writes.
- Store pending sets as saved in JS memory.
- Delay writes until app idle.
- Hide rejected operations.

Acceptance checks:
- Two queued writes run sequentially.
- Queue reports active operation correctly.
- Failed operation does not permanently block later operations.
```

### 10.3 Codex Prompt: Workout Services

```text
Task: Implement workout service layer

Context:
Services coordinate repositories and WorkoutWriteQueue. UI should call services/controllers, not raw repositories directly.

Files to inspect first:
- src/features/workouts/services
- src/features/workouts/repositories
- src/database/writeQueue.ts

Implementation requirements:
1. Add service functions for:
   - start/get active workout
   - add exercise or focus latest
   - add exercise as new block
   - add set
   - edit set
   - delete set
   - finish workout
   - discard workout
2. All active workout mutations must go through WorkoutWriteQueue.
3. Return controlled Result values.
4. Do not mark set as saved before repository success.

Do not:
- Let UI calculate set_number.
- Let UI perform resequencing.
- Let UI directly run SQL.

Acceptance checks:
- Service tests or mocked repository tests pass.
- Rapid add set service calls serialize.
```

### 10.4 Gate

```text
WorkoutWriteQueue tested
Service layer compiles
No delayed persistence behavior
```

---

## 12. Phase 7 — Active Workout State and Components

### 11.1 Goal

Implement the highest-risk screen using selector-based state and local input isolation.

---

### 11.2 Codex Prompt: Active Workout Store/Controller

```text
Task: Implement ActiveWorkoutControllerProvider and selector hooks

Context:
The active workout screen must avoid full-screen re-renders when the user types weight/reps. Saved data and lock states belong to the active workout controller/store. Unsaved input text belongs inside SetInputForm.

Files to inspect first:
- src/features/workouts/containers
- src/features/workouts/state
- src/features/workouts/hooks
- Component Design active workout state sections

Implementation requirements:
1. Implement active workout state shape for:
   - workout summary
   - workoutExerciseIds
   - workoutExercisesById
   - setsByWorkoutExerciseId
   - workoutWriteState
   - blockWriteStateById
   - isReloading
   - error
   - staleWriteRecovery
2. Provide selector hooks so child components subscribe only to needed slices.
3. Implement actions:
   - loadActiveWorkout
   - reloadWorkout
   - addSet
   - editSet
   - deleteSet
   - addExerciseBlock
   - addExerciseAsNewBlock
   - moveExerciseBlock
   - deleteExerciseBlock
   - finishWorkout
   - discardWorkout
   - recoverFromStuckWrite
4. Use block-level lock for set operations.
5. Use workout-level lock for finish/discard/add/move/delete block.
6. Disable workout-level actions while any block write is active.
7. Clear locks in finally.
8. Add stuck-write recovery state without blindly unlocking.

Do not:
- Store SetInputForm weight/reps text in the global store.
- Pass the entire active workout state into every child.
- Let workout-level operations run while a block write is active.

Acceptance checks:
- Selector hooks compile.
- Typing local input does not update active workout store.
- Add Set sets only that block lock.
- Finish disabled while block write active.
```

---

### 11.3 Codex Prompt: Active Workout Screen Layout

```text
Task: Implement Start / Continue Workout screen layout

Context:
The active workout screen is the core real-gym logging screen. It must be compact, fast, and safe.

Files to inspect first:
- src/features/workouts/screens/StartWorkoutScreen.tsx
- src/features/workouts/containers
- src/features/workouts/components
- UI Flow Start / Continue Workout section
- Component Design Active Workout Screen hierarchy

Implementation requirements:
1. Implement hierarchy:
   StartWorkoutScreen
     ActiveWorkoutControllerProvider
       ActiveWorkoutContent
         ActiveWorkoutTopBar
         WorkoutInfoCard
         WriteRecoveryBanner
         AddExerciseButton
         ExerciseBlockList
         FinishWorkoutButton
2. Show live timer for non-stale active workout.
3. Show stale age/status instead of long timer when stale.
4. Add top-right menu with Discard Workout.
5. Add Add Exercise button.
6. Render exercise blocks by ID through ExerciseBlockContainer.
7. Respect lock states.

Do not:
- Render fake saved sets not backed by SQLite.
- Store all block data in screen props if selector containers exist.
- Add drag-and-drop reordering for v1 unless explicitly requested.

Acceptance checks:
- Screen loads active workout.
- Empty active workout renders.
- Add Exercise navigation works as placeholder or real route.
- TypeScript passes.
```

---

### 11.4 Codex Prompt: ExerciseBlockContainer and SetInputForm

```text
Task: Implement ExerciseBlockContainer, ExerciseBlockCard, SetRow, and SetInputForm

Context:
SetInputForm must own local TextInput state. It must not cause full-screen re-renders. Add Set must use a local submit guard to prevent rapid double-tap duplicate submissions.

Files to inspect first:
- src/features/workouts/components
- src/features/workouts/containers
- Component Design SetInputForm and input isolation sections
- UI Flow set input behavior

Implementation requirements:
1. ExerciseBlockContainer subscribes only to one block, its sets, and its block lock.
2. ExerciseBlockCard is presentational.
3. SetRow displays saved sets and edit/delete actions.
4. SetInputForm owns:
   - weightText
   - repsText
   - notesText
   - touched flags
   - local validation error
   - localSubmitting state
5. SetInputForm must use submitGuardRef for immediate double-tap protection.
6. Add Set button disabled when:
   - parent disabled
   - parent isSaving
   - localSubmitting
   - submitGuardRef.current
7. On successful save:
   - clear reps and notes
   - reset touched flags
   - apply next allowed weight suggestion
8. On failed save:
   - keep typed values
   - show friendly error
9. Autofill must not overwrite touched weight input.

Do not:
- Store typed weight/reps in StartWorkoutScreen.
- Hydrate new autofill suggestion over touched.weight === true.
- Rely only on parent isSaving to block double taps.
- Add set_number input editing in v1.

Acceptance checks:
- Rapid double tap calls onAddSet once.
- Failed save keeps typed values.
- New suggestion prop does not overwrite touched weight input.
- Typing in one block does not reset other block input.
```

---

### 11.5 Codex Prompt: WorkoutTimer

```text
Task: Implement WorkoutTimer safely

Context:
WorkoutTimer is derived client-side only. It must not write timer ticks to SQLite. It must handle React Native background/resume and cleanup intervals/listeners.

Files to inspect first:
- src/features/workouts/components/WorkoutTimer.tsx
- src/features/workouts/hooks/useWorkoutTimer.ts, if present
- Component Design WorkoutTimer section
- UI Flow timer sections

Implementation requirements:
1. displayedDuration = Date.now() - startedAt.
2. Never write timer ticks to SQLite.
3. Use shouldRunTimer:
   isWorkoutActive && !isWorkoutStale && !isWorkoutCompleted && isScreenFocused
4. useEffect must depend on shouldRunTimer and startedAt.
5. If shouldRunTimer is false, return early and do not create interval.
6. Use setInterval only to trigger re-render while running.
7. Use AppState.addEventListener('change', ...) to update immediately when app returns active.
8. Cleanup must call:
   - clearInterval(intervalId)
   - appStateSubscription.remove()
9. Stop timer when workout becomes stale, completed, hidden, or screen loses focus.
10. Show stale age label outside or instead of normal timer.

Do not:
- Use an empty dependency array for the timer effect.
- Persist timer values.
- Let old intervals continue after unmount or stale/completed state.

Acceptance checks:
- Timer displays active duration.
- Timer catches up after AppState active event.
- Cleanup runs on unmount.
- Interval stops when shouldRunTimer becomes false.
```

### 11.6 Gate

```text
Active workout screen compiles
SetInputForm tests pass
WorkoutTimer tests pass
Manual add-set flow works with SQLite
```

---

## 13. Phase 8 — Exercise Selection and Exercise Management

### 12.1 Codex Prompt: Exercise Selection Screen

```text
Task: Implement Exercise Selection screen

Context:
The user adds exercises to an active workout. If the exercise already exists in the workout, default behavior is to focus the latest existing block and show snackbar action Add as New Block.

Files to inspect first:
- src/features/exercises/screens
- src/features/exercises/components
- src/features/workouts/services
- UI Flow Exercise Selection section

Implementation requirements:
1. Show exercise search.
2. Show muscle group filter chips.
3. Show active non-archived exercises.
4. Show last record preview if available and practical.
5. Selecting new exercise appends new block and returns to active workout screen.
6. Selecting duplicate exercise focuses latest existing block and shows snackbar:
   "Jumped to existing block. [Add as New Block]"
7. Snackbar action appends same exercise as a new block.
8. Keep Add as New Block available in Exercise Block Menu.

Do not:
- Block duplicate exercises entirely.
- Show a modal as the default duplicate path.
- Include archived exercises by default.

Acceptance checks:
- Search/filter works.
- New exercise creates block.
- Duplicate selection focuses latest block.
- Snackbar action creates new block.
```

### 12.2 Codex Prompt: Exercise Management

```text
Task: Implement Exercise Management screen

Context:
Exercise Management allows custom exercise create/edit/delete/archive. Default exercises are not editable in v1. Used exercises must be archived instead of deleted.

Files to inspect first:
- src/features/exercises/screens
- src/features/exercises/components
- src/features/exercises/repositories
- UI Flow Exercise Management section

Implementation requirements:
1. Render exercise list with search/filter.
2. Add custom exercise form.
3. Edit custom exercise form.
4. Delete unused custom exercise after confirmation.
5. Archive used exercise after confirmation.
6. Block permanent delete for used exercises.
7. Hide archived exercises from normal selection by default.

Do not:
- Edit default exercises.
- Delete used exercises.
- Break old workout history.

Acceptance checks:
- Custom exercise CRUD/archive behavior matches design.
- Used exercise delete is blocked.
```

### 12.3 Gate

```text
Exercise selection works inside active workout
Exercise management does not break history
```

---

## 14. Phase 9 — Workout History and Exercise History

### 13.1 Codex Prompt: Workout History and Detail

```text
Task: Implement Workout History and Workout Detail screens

Context:
The user must view completed workouts newest first and open details showing exercises and sets.

Files to inspect first:
- src/features/workouts/screens/WorkoutHistoryScreen.tsx
- src/features/workouts/screens/WorkoutDetailScreen.tsx
- WorkoutRepository
- UI Flow Workout History and Workout Detail sections

Implementation requirements:
1. Workout History lists completed workouts newest first.
2. Each item shows date, title/default label, exercise count, set count.
3. Empty state appears when no completed workouts exist.
4. Workout Detail shows workout summary, notes, exercise blocks, and read-only set rows.
5. Delete workout requires confirmation and mentions set count.

Do not:
- Show in_progress workouts in completed history.
- Delete without confirmation.

Acceptance checks:
- Completed workout appears in history after finish.
- Detail shows correct exercise order and set order.
- Delete workout cascades correctly.
```

### 13.2 Codex Prompt: Exercise Detail Progress

```text
Task: Implement Exercise Detail progress screen

Context:
Version 1 progress is simple: last record, best weight, and history list. Advanced charts are out of scope.

Files to inspect first:
- src/features/exercises/screens/ExerciseDetailScreen.tsx
- ExerciseRepository or workout history queries
- Requirement Document exercise progress requirements
- UI Flow Exercise Detail section

Implementation requirements:
1. Show exercise summary.
2. Show last completed workout record for this exercise.
3. Show best weight for this exercise.
4. Show exercise history grouped/sorted by date.
5. Use completed workouts only for historical progress.
6. Empty state if exercise has no history.

Do not:
- Add advanced charts.
- Add volume analytics.
- Include in_progress sets in historical PR summaries unless explicitly designed.

Acceptance checks:
- Last record is correct.
- Best weight is correct.
- History preserves workout and set order.
```

### 13.3 Gate

```text
Workout history/detail works
Exercise last/best/history works
No advanced analytics added
```

---

## 15. Phase 10 — Bodyweight Tracking

### 14.1 Codex Prompt: Body Record Screen

```text
Task: Implement Body Record screen

Context:
The app tracks one bodyweight record per date. Add and edit flows must handle duplicate dates safely.

Files to inspect first:
- src/features/bodyRecords/screens
- src/features/bodyRecords/components
- BodyRecordRepository
- UI Flow Body Record section
- Component Design Body Record components

Implementation requirements:
1. BodyRecordForm owns local typed state.
2. Add bodyweight validates bodyweight > 0.
3. If adding a date that exists, show confirmation to update existing.
4. History list shows records newest first.
5. Edit form can change date, bodyweight, notes.
6. If edit date changes to an existing record date, show confirmation:
   "A bodyweight record already exists for this date. Replace it with this edited record?"
7. If confirmed, use repository transaction:
   BEGIN TRANSACTION
     DELETE existing target-date record
     UPDATE source record to target date, bodyweight, and notes
   COMMIT
8. Delete body record requires confirmation.
9. Show controlled errors, not raw SQLite messages.

Do not:
- Silently create duplicate dates.
- Update source date before deleting target date.
- Store form input globally.

Acceptance checks:
- Add record works.
- Add duplicate asks update.
- Edit to unused date works.
- Edit to existing date uses replace confirmation.
- Replacement preserves source ID.
- Delete asks confirmation.
```

### 14.2 Gate

```text
Bodyweight one-record-per-date behavior works
Collision transaction tested
```

---

## 16. Phase 11 — Backup Export and Import

### 15.1 Codex Prompt: Backup Export

```text
Task: Implement JSON backup export

Context:
The app must export all local user data into a portable JSON backup envelope with backup_version and app_schema_version.

Files to inspect first:
- src/features/backup
- Database Design Backup Export Format
- Requirement Document backup requirements

Implementation requirements:
1. Export envelope:
   - app_name: "Gym Progress Tracker"
   - backup_version
   - app_schema_version
   - exported_at
   - exported_app_version, optional
   - data
2. Include data sections:
   - exercises
   - workouts
   - workout_exercises
   - workout_sets
   - body_records
3. Preserve stable IDs.
4. Include archived exercises.
5. Use readable controlled error if export fails.

Do not:
- Export analytics/device identifiers.
- Exclude archived exercises needed by history.
- Change backup format without updating validators.

Acceptance checks:
- Export JSON contains required envelope fields.
- Export includes all required tables.
- Export can be parsed by backup validator.
```

### 15.2 Codex Prompt: Backup Import Validation and Transformers

```text
Task: Implement backup import validation and transformer structure

Context:
Import must validate backup files before replacing local data. Older backup versions should import only if a transformer chain exists. Newer backup versions must be rejected.

Files to inspect first:
- src/features/backup/validators
- src/features/backup/transformers
- src/features/backup/fixtures
- Database Design Backup Import Lifecycle

Implementation requirements:
1. Implement envelope validator.
2. Validate required sections and IDs.
3. Validate referential integrity.
4. Reject multiple in_progress workouts.
5. Reject newer backup_version clearly.
6. Add transformer chain structure even if current version is v1.
7. Add fixtures:
   - backup-v1-valid.json
   - backup-v1-invalid-multiple-active-workouts.json
8. Add tests for valid and invalid fixtures.

Do not:
- Import before validation.
- Delete current data before validation succeeds.
- Accept newer backup versions.
- Silently ignore invalid rows.

Acceptance checks:
- Valid fixture passes.
- Multiple-active-workout fixture fails.
- Newer backup version fails with readable error.
```

### 15.3 Codex Prompt: Replace-Style Import Transaction

```text
Task: Implement replace-style backup import transaction

Context:
Version 1 supports replace-style import only. Import must be atomic. If any insert fails, previous local data must remain unchanged.

Files to inspect first:
- src/features/backup/services
- src/database/transaction.ts
- Database Design Replace-Style Import Transaction
- Requirement Document import safety requirements

Implementation requirements:
1. Parse selected JSON file.
2. Validate envelope and data.
3. Transform old backup if supported.
4. Show or return state requiring destructive confirmation before replace.
5. After confirmation, run one transaction:
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
6. Rollback if any step fails.
7. Preserve current local data after failed import.

Do not:
- Merge imports in v1.
- Partially replace outside transaction.
- Run import without confirmation.

Acceptance checks:
- Valid import replaces data.
- Failed import preserves old data.
- UI shows confirmation before replace.
```

### 15.4 Gate

```text
Export works
Valid import works
Invalid import rejected
Failed import rollback verified
```

---

## 17. Phase 12 — UI Polish and Shared Components

### 16.1 Codex Prompt: Shared Components

```text
Task: Implement shared UI components

Context:
The app should use simple reusable components for consistent UI and safe confirmations.

Files to inspect first:
- src/shared/components
- Component Design Shared Components section
- UI Flow Common UI Components section

Implementation requirements:
1. Implement or normalize:
   - AppButton
   - AppTextInput
   - ConfirmDialog
   - EmptyState
   - LoadingState
   - ErrorState
   - SnackbarHost
2. AppButton must not call onPress when disabled or loading.
3. Danger variant used for destructive actions.
4. ConfirmDialog supports loading and destructive state.
5. Error messages should be friendly.

Do not:
- Show raw SQLite errors directly to users.
- Add heavy UI framework without explicit approval.

Acceptance checks:
- Shared components compile.
- Destructive actions use ConfirmDialog.
```

### 16.2 Codex Prompt: Empty/Loading/Error States

```text
Task: Add empty, loading, saving, and error states across screens

Context:
Each main screen should handle Loading, Empty, Ready, Saving, Recovering, and Error states where appropriate.

Files to inspect first:
- src/features/*/screens
- UI Flow Screen State Requirements

Implementation requirements:
1. Add loading state for initial SQLite reads.
2. Add empty state for no workouts, no body records, no exercise history.
3. Add saving state for write operations.
4. Add recovery state for long active workout writes.
5. Add friendly error messages.

Do not:
- Block the whole app for small reads.
- Show raw technical errors to normal users.

Acceptance checks:
- Empty app states are readable.
- Failed save shows friendly retry/error message.
```

### 16.3 Gate

```text
Screens handle common states
Destructive actions confirmed
No raw SQLite errors in user-facing UI
```

---

## 18. Phase 13 — Testing and Hardening

### 17.1 Codex Prompt: Repository Tests

```text
Task: Add repository tests for database integrity rules

Context:
Database constraints and transactions are core to app safety. Tests must cover the known traps.

Files to inspect first:
- test setup
- src/features/*/repositories
- Database Design Test Checklist
- System Design Testing Strategy

Implementation requirements:
Add tests for:
1. Single active workout partial unique index.
2. getOrCreateActiveWorkout double-call behavior.
3. Repeated exercise blocks allowed.
4. Duplicate exercise order rejected.
5. moveExerciseBlock uses safe parking transaction.
6. Add set creates sequential set numbers.
7. Rapid add set calls produce sequential set numbers.
8. Delete set resequences remaining sets.
9. Duplicate body record date rejected.
10. Bodyweight edit-date replacement transaction.
11. Import rollback preserves previous data.

Do not:
- Mock away the transaction behavior for transaction-specific tests.
- Only test happy paths.

Acceptance checks:
- Tests fail before bad implementation and pass after correct implementation.
- Test names clearly describe the database rule being protected.
```

### 17.2 Codex Prompt: Component Tests

```text
Task: Add component tests for active workout performance and lifecycle traps

Context:
Component Design defines React Native-specific safeguards: local input state, submit guard, autofill hydration protection, and timer cleanup.

Files to inspect first:
- src/features/workouts/components
- Component Design Component Testing Strategy

Implementation requirements:
Add tests for:
1. SetInputForm validates empty weight/reps.
2. SetInputForm blocks rapid double-tap duplicate submissions.
3. SetInputForm keeps typed values after failed save.
4. SetInputForm clears/resets correctly after successful save.
5. New autofill suggestion does not overwrite touched weight input.
6. WorkoutTimer displays derived duration.
7. WorkoutTimer recalculates on AppState active resume.
8. WorkoutTimer removes AppState listener and clears interval on cleanup.
9. WorkoutTimer stops interval when shouldRunTimer becomes false.

Do not:
- Remove submitGuardRef because parent isSaving exists.
- Use empty dependency array for timer effect.

Acceptance checks:
- Component tests pass.
- Timer cleanup is verified.
```

### 17.3 Codex Prompt: Manual Test Script

```text
Task: Create manual QA checklist for real Android testing

Context:
The app must be tested during real gym-style usage, not only emulator tests.

Files to inspect first:
- docs or project root
- Requirement Document acceptance criteria
- Implementation Plan testing gates

Implementation requirements:
Create a manual QA checklist covering:
1. Fresh install database startup.
2. Default exercise seed.
3. Start workout.
4. Add exercise.
5. Add sets quickly.
6. Close/reopen app during active workout.
7. Continue unfinished workout.
8. Stale workout handling.
9. Finish workout.
10. Workout history/detail.
11. Exercise detail last/best/history.
12. Bodyweight add/edit/delete/collision.
13. Backup export/import.
14. Failed import rollback.
15. APK installation on Android.

Do not:
- Add automated tools unless explicitly requested.

Acceptance checks:
- Checklist is clear enough to follow on a phone.
```

### 17.4 Gate

```text
Repository tests pass
Component tests pass
Manual QA checklist exists
Core flows tested on Android device if available
```

---

## 19. Phase 14 — APK Build

### 18.1 Codex Prompt: APK Build Preparation

```text
Task: Prepare Android standalone APK build configuration

Context:
Version 1 final runtime must be a standalone Android APK. Expo Go may be used only for early temporary testing.

Files to inspect first:
- app.json or app.config.ts
- eas.json
- package.json
- System Design Android APK Build Strategy
- Requirement Document platform requirements

Implementation requirements:
1. Ensure app metadata is set:
   - app name
   - Android package identifier
   - version
   - icon/splash placeholders if available
2. Add or update EAS build configuration for Android APK.
3. Document build command.
4. Keep permissions minimal and limited to backup import/export needs.

Do not:
- Add unnecessary permissions.
- Configure iOS as a required v1 target.
- Add analytics/crash tracking packages without approval.

Acceptance checks:
- Expo config validates.
- EAS Android APK build command is documented.
```

### 18.2 Gate

```text
Expo config validates
Android APK build path documented
Installable APK produced when running EAS build
```

---

## 20. Suggested Commit Plan

Use small commits. Suggested order:

```text
chore: initialize expo typescript project structure
feat: add navigation shell
feat: add sqlite adapter and migration runner
feat: add initial sqlite schema and indexes
feat: seed default exercises
feat: add shared domain types and validators
feat: implement workout repositories
feat: implement exercise and body record repositories
feat: add workout write queue and services
feat: implement active workout controller store
feat: implement active workout screen and set input
feat: add workout timer lifecycle handling
feat: implement exercise selection flow
feat: implement workout and exercise history
feat: implement bodyweight tracking flow
feat: implement backup export
feat: implement backup import validation and transaction
feat: add shared UI states and confirmation dialogs
test: add repository integrity tests
test: add active workout component tests
chore: prepare android apk build
```

Avoid giant commits such as:

```text
feat: build app
```

---

## 21. Review Checklist for Every Codex Diff

Before accepting a Codex diff, check:

```text
Scope:
- Did it only change files relevant to the task?
- Did it add features outside v1?

Database:
- Did it preserve schema constraints?
- Did it keep transactions where required?
- Did it avoid database reset during migration?

Workout logging:
- Are sets saved immediately?
- Is set_number calculated inside transaction?
- Are writes serialized through WorkoutWriteQueue?
- Is the UI waiting for SQLite success before showing saved data?

Active workout UI:
- Does SetInputForm keep typed input local?
- Is there a local submit guard?
- Are block/workout locks respected?
- Are workout-level actions disabled during block writes?

Timer:
- Is duration derived from Date.now() - startedAt?
- Does it use AppState resume update?
- Does it clean up interval/listener?
- Does it avoid empty dependency-array trap?

Backup:
- Is import validated before replace?
- Is replace import atomic?
- Does failed import preserve current data?
- Are fixtures/tests updated if format changes?

Styling:
- Does styling use src/shared/theme/theme.ts tokens?
- Did it avoid Tailwind/NativeWind/className styling?
- Did it preserve Warm Iron Light colors?
- Did it avoid pure white #FFFFFF surfaces and pure black #000000 text?

User experience:
- Are destructive actions confirmed?
- Are error messages friendly?
- Is the flow still fast during workout logging?
```

---

## 22. Red Flags When Reviewing Codex Output

Reject or revise the diff if you see:

```text
- Any new backend/login/cloud sync code.
- Analytics or tracking package added.
- Auto-increment IDs used for main records.
- workout_sets directly used without workout_exercises.
- UNIQUE(workout_id, exercise_id) added.
- set_number calculated outside transaction.
- Sets stored in JS memory as pending saved data.
- Optimistic saved set row before SQLite commit.
- Direct exercise_order swap without parking values.
- Negative parking values despite CHECK(order > 0).
- Body record duplicate date handled by blind update.
- Body edit collision updates source date before deleting target.
- SetInputForm input state lifted to StartWorkoutScreen.
- Timer useEffect with [] dependency while using interval/AppState.
- AppState listener without remove() cleanup.
- setInterval without clearInterval cleanup.
- Tailwind, NativeWind, className styling, or new styling framework added.
- Hardcoded feature colors instead of theme tokens.
- Blue primary color introduced.
- Pure white #FFFFFF surface or pure black #000000 text introduced.
- Import deletes current data before validation.
- Import transaction missing rollback behavior.
```

---

## 23. First Codex Task to Run

Recommended first task:

```text
Task: Initialize Gym Progress Tracker project structure
```

Reason:

```text
This creates the folder foundation without touching risky business logic.
```

Do not start with the active workout screen. The active workout screen depends on database, repositories, write queue, services, and selector-based state.

---

## 24. Summary

This checklist is designed to keep Codex productive and controlled.

The main strategy is:

```text
Small task → strict guardrails → review diff → run checks → commit → next task
```

The most important implementation risks are already known:

- SQLite constraint collisions.
- Active workout write races.
- Full-screen re-renders during input.
- Double-tap duplicate submissions.
- Timer background/resume drift.
- Timer memory leaks.
- Autofill overwriting typed input.
- Bodyweight date collision transactions.
- Backup import partial replacement.

Each Codex task should protect these decisions instead of reopening them.

---

## Styling Decision Addendum

The project owner has chosen **not** to use Tailwind or NativeWind for v1.

Accepted styling stack:

```text
React Native StyleSheet
Centralized src/shared/theme/theme.ts tokens
Warm Iron Light palette
Shared base components
```

Rejected for v1:

```text
Tailwind CSS
NativeWind
Utility-class styling
Blue primary color
Pure white surfaces
Pure black text
Feature-level hardcoded colors
```

Reason:

```text
The MVP needs predictable, simple, token-based styling that Codex can follow safely while the implementation focuses on SQLite safety, active workout performance, and offline-first behavior.
```
