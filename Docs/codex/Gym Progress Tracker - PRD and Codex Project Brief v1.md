# Gym Progress Tracker — PRD and Codex Project Brief v1

**Document Status:** Draft v1  
**Primary Use:** High-level product brief and implementation guardrails for Codex  
**Source of Truth:** Current project design documents  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Date:** 2026-07-05

---

## 1. Purpose

This document is the compact product and implementation brief for **Gym Progress Tracker v1**.

It is intended to help Codex understand the project quickly before making code changes.

This document does not replace the detailed design documents. Instead, it summarizes the product, locked decisions, scope boundaries, and guardrails. For exact schema, transactions, UI flows, and component responsibilities, Codex must refer to the relevant detailed document listed in Section 16.

---

## 2. Product Overview

**Gym Progress Tracker** is an offline-first mobile app for recording gym workouts, tracking exercise performance, recording bodyweight, and protecting local data through JSON export/import backup.

The app is designed for a beginner gym user who wants a simple, fast way to track workout progress during real gym sessions.

Version 1 is intentionally local-only and simple:

```text
Android phone
React Native + Expo + TypeScript
SQLite local database
JSON export/import backup
Standalone APK final runtime
```

There is no backend, login, cloud sync, social feature, AI coach, or nutrition feature in v1.

---

## 3. Target User

The target user for v1 is:

```text
A beginner gym user who wants to track workout progress using a simple mobile app during real workouts.
```

The user needs to answer questions like:

- What exercise did I do last time?
- What weight did I use?
- How many reps did I complete?
- Am I getting stronger over time?
- How is my bodyweight changing?
- Can I restore my data if I move devices or reinstall the app?

---

## 4. Product Goals

Version 1 must let the user:

1. Create and continue workout sessions.
2. Add exercises to a workout.
3. Record sets with weight, reps, and optional notes.
4. Edit and delete recorded sets.
5. View workout history.
6. View exercise history, last record, and best weight.
7. Add, edit, and delete bodyweight records.
8. Export all local data to a JSON backup file.
9. Import a valid JSON backup file using replace-style import.
10. Use the app fully offline.
11. Install and use the final app as an Android standalone APK.

---

## 5. MVP Scope

### 5.1 Included in v1

- Workout session tracking.
- Continue unfinished workout.
- Exercise list.
- Default exercise seed data.
- Custom exercise creation.
- Custom exercise editing.
- Safe delete/archive behavior for exercises.
- Add exercise to active workout.
- Repeated exercise blocks inside the same workout.
- Set tracking with weight, reps, and notes.
- Immediate set saving.
- Edit set.
- Delete set with resequencing.
- Workout history.
- Workout detail.
- Exercise detail/history.
- Last record and best weight summary.
- Bodyweight tracking.
- One bodyweight record per date.
- JSON export backup.
- JSON import backup with validation and transaction-safe replace.
- Versioned SQLite migrations.
- Stable local string IDs or UUID-style IDs.
- Android standalone APK build.

### 5.2 Not included in v1

Codex must not add these unless explicitly instructed in a future version:

- Login.
- Register.
- Backend API.
- Cloud database.
- Cloud sync.
- Multi-device sync.
- AI workout coach.
- Workout recommendation system.
- Nutrition tracking.
- Social features.
- Advanced analytics dashboard.
- Full chart system.
- Rest timer.
- Workout templates.
- RPE tracking.
- Progress photos.
- Waist measurement.
- Payment or subscription features.
- Ads.
- Analytics/tracking SDK.

---

## 6. Locked Technical Stack

| Area | Decision |
|---|---|
| Mobile framework | React Native |
| Tooling | Expo |
| Language | TypeScript |
| Local database | SQLite |
| Backup format | JSON |
| Build output | Android standalone APK |
| Build tool | EAS Build |
| Final runtime | Standalone app, not Expo Go |
| Weight unit | Kilograms only |
| Backend | None in v1 |
| Authentication | None in v1 |
| Cloud sync | None in v1 |

Likely Expo modules:

| Need | Suggested module |
|---|---|
| SQLite | `expo-sqlite` |
| File selection for import | `expo-document-picker` |
| Backup file writing | `expo-file-system` |
| Backup sharing/export | `expo-sharing` |

Exact Expo package versions should be checked during implementation.

---

## 7. Core User Flows

## 7.1 Start or continue workout

```text
Home
  ↓
If no active workout:
  Start Workout
  create in_progress workout
  open active workout screen

If active workout exists:
  Continue Workout
  open active workout screen
```

Only one workout can be `in_progress` at a time.

## 7.2 Record sets during workout

```text
Start / Continue Workout Screen
  ↓
Add Exercise
  ↓
Select exercise
  ↓
Exercise block appears
  ↓
Enter weight and reps
  ↓
Tap Add Set
  ↓
Set is saved immediately to SQLite
  ↓
Set appears only after SQLite commit succeeds
```

## 7.3 Continue workout after app close

```text
User records sets
  ↓
User closes app before finishing workout
  ↓
User reopens app
  ↓
Home detects in_progress workout
  ↓
User continues workout
```

This is a must-have behavior.

## 7.4 Handle stale workout

A workout is stale when:

```text
status = in_progress
AND started_at is older than 24 hours
```

If stale workout has zero sets:

```text
Primary: Continue Workout
Secondary: Discard Workout
```

If stale workout has recorded sets:

```text
Primary: Finish Workout
Secondary: Continue Workout
Danger: Discard Workout
```

When finishing a stale workout with sets:

```text
completed_at = latest workout_set.created_at
```

## 7.5 Select duplicate exercise

If the selected exercise already exists in the active workout:

```text
Focus latest existing block
Show snackbar: "Jumped to existing block. [Add as New Block]"
```

The permanent fallback is:

```text
Exercise Block Menu → Add as New Block
```

## 7.6 Add bodyweight

```text
Body tab
  ↓
Enter date and bodyweight
  ↓
If date does not exist:
  create record

If date already exists:
  ask whether to update existing record
```

## 7.7 Edit bodyweight date collision

If the user edits a bodyweight record and changes its date to a date that already exists, the app must ask before replacing.

If confirmed, repository must use this exact transaction order:

```text
BEGIN TRANSACTION
  DELETE existing target-date record
  UPDATE source record to target date, bodyweight, and notes
COMMIT
```

This preserves the edited/source record ID and avoids `UNIQUE(record_date)` violation.

## 7.8 Export backup

```text
Settings
  ↓
Export Data
  ↓
Read local data
  ↓
Build backup JSON envelope
  ↓
Write/share file
```

## 7.9 Import backup

```text
Settings
  ↓
Import Data
  ↓
Select JSON file
  ↓
Parse and validate
  ↓
Transform older backup version if supported
  ↓
Show destructive confirmation
  ↓
Replace local data inside transaction
```

If import fails, previous local data must remain unchanged.

---

## 8. Data Model Summary

The main SQLite tables are:

| Table | Purpose |
|---|---|
| `exercises` | Default and custom exercises. |
| `workouts` | Workout sessions. |
| `workout_exercises` | Exercise blocks inside workouts. |
| `workout_sets` | Sets inside exercise blocks. |
| `body_records` | Bodyweight records. |
| `app_meta` | Internal metadata. |

Important relationship:

```text
workouts
  → workout_exercises
      → workout_sets
```

`workout_sets` belongs to `workout_exercises.id`, not only to the pair of `workout_id` and `exercise_id`.

This supports repeated exercise blocks inside one workout.

---

## 9. Locked Database Rules

Codex must not weaken these rules.

## 9.1 Single active workout

Only one workout may be in progress.

Database must enforce this with a partial unique index:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_workouts_single_in_progress
ON workouts(status)
WHERE status = 'in_progress';
```

Repository must catch the expected unique constraint race and return the existing active workout.

## 9.2 Repeated exercise blocks allowed

Do not add this constraint:

```sql
UNIQUE(workout_id, exercise_id)
```

The same exercise may appear more than once in a workout.

## 9.3 Exercise block order must be unique

`workout_exercises` must enforce:

```text
UNIQUE(workout_id, exercise_order)
```

Reordering must use positive parking values inside one transaction.

## 9.4 Set numbers must be unique inside block

`workout_sets` must enforce:

```text
UNIQUE(workout_exercise_id, set_number)
```

Add Set must calculate `MAX(set_number) + 1` inside the same transaction as insert.

## 9.5 Delete set must resequence

After deleting Set 2 from `1, 2, 3`, the visible result must become:

```text
1, 2
```

not:

```text
1, 3
```

Resequencing must happen inside the same delete transaction and use positive parking values if needed.

## 9.6 Bodyweight one record per date

`body_records` must enforce:

```text
UNIQUE(record_date)
```

Same-date add/edit collisions must be handled explicitly by UI and repository.

---

## 10. Active Workout Safety Rules

The active workout screen is the most important and most performance-sensitive screen.

Codex must preserve these rules:

1. Do not batch workout set writes in memory.
2. Do not delay workout writes until the end of the workout.
3. Do not show a set as saved before SQLite confirms commit.
4. Use `WorkoutWriteQueue` only to serialize immediate write promises.
5. Use transactions for multi-step write operations.
6. Use block-level lock for Add/Edit/Delete Set.
7. Use workout-level lock for Finish/Discard/Add Block/Move Block/Delete Block.
8. Disable workout-level actions while any block-level write is active.
9. Do not silently unlock stuck writes after a timeout.
10. Use recovery UI that reloads from SQLite and checks queue state.

---

## 11. Active Workout Component Rules

Codex must preserve the component architecture rules.

## 11.1 State ownership

```text
Saved workout data → active workout controller/store
Unsaved TextInput values → local form component state
Write locks → controller/store with scoped selectors
```

Do not store every `weightText` and `repsText` field in `StartWorkoutScreen`.

## 11.2 Selector-based subscriptions

`ExerciseBlockContainer` should subscribe only to the data for its own block.

Typing in one `SetInputForm` must not re-render the whole active workout screen.

## 11.3 Input isolation

`SetInputForm` owns:

- `weightText`
- `repsText`
- `notesText`
- touched state
- local validation errors
- local submit guard

It calls `onAddSet()` only when the user taps **Add Set**.

## 11.4 Local submit guard

`SetInputForm` must use an immediate synchronous local guard, such as `submitGuardRef`, to prevent rapid double-tap duplicate submissions before parent lock state updates.

## 11.5 Autofill safety

Autofill suggestions may hydrate local weight only:

1. On mount when `touched.weight === false`.
2. After successful save/reset.
3. If user explicitly chooses a future “Use suggestion” action.

Autofill must never overwrite touched local input during parent re-renders or data reloads.

## 11.6 Workout timer safety

Workout timer must:

- Derive display from `Date.now() - startedAt`.
- Never write timer ticks to SQLite.
- Use `AppState` to recalculate on resume.
- Use effect dependencies such as `shouldRunTimer` and `startedAt`.
- Not use an empty dependency array for timer lifecycle.
- Clear intervals in cleanup.
- Remove AppState subscriptions in cleanup.
- Stop when workout is stale, completed, hidden, or screen loses focus.

---

## 12. Backup and Import Rules

Backup is a core data-safety feature.

Codex must preserve these rules:

1. Export must include a backup envelope.
2. Export must include backup version information.
3. Import must validate the file before replacing local data.
4. Import must reject newer unsupported backups.
5. Import must transform older backup versions when a transformer exists.
6. Import must reject older backups if no transformer exists.
7. Import must validate transformed data before transaction.
8. Replace import must run inside one SQLite transaction.
9. Failed import must rollback and preserve existing local data.
10. Historical backup fixtures must be maintained for every supported backup version.

Current backup envelope shape:

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

---

## 13. UX and Validation Rules

## 13.1 Workout set validation

- Weight is required.
- Weight must be zero or greater.
- Reps are required.
- Reps must be greater than zero.
- Reps must be a whole number.
- Notes are optional.

## 13.2 Bodyweight validation

- Date is required.
- Bodyweight is required.
- Bodyweight must be greater than zero.
- Same-date collision must ask the user before update/replace.

## 13.3 Exercise validation

- Exercise name is required.
- Muscle group is required.
- Equipment is optional.
- Default exercises are not editable in v1.
- Used exercises must be archived/hidden instead of permanently deleted.

## 13.4 Destructive action confirmation

These actions require confirmation:

- Discard workout.
- Delete workout.
- Delete exercise block with sets.
- Delete set.
- Delete bodyweight record.
- Delete unused exercise.
- Archive used exercise.
- Import and replace backup.

Confirmations should mention exact set count where relevant.

---

## 14. Performance Requirements

The app must feel fast during real gym use.

Important performance rules:

1. Do not update SQLite or global state on every keystroke.
2. Keep set input values local until submit.
3. Avoid full-screen re-renders when typing weight/reps.
4. Use FlatList or virtualization for long lists where appropriate.
5. Keep Add Set write small and immediate.
6. Timer should re-render only timer display, not the whole workout screen.
7. Avoid unnecessary permissions, network calls, or background jobs.
8. Test on a real Android phone, ideally a lower-end device.

---

## 15. Acceptance Criteria

The v1 MVP is successful when:

1. User can create a workout session.
2. User can continue an unfinished workout after app close/reopen.
3. User can add exercises to a workout.
4. User can record sets, reps, and weight.
5. Each set is saved immediately after user records it.
6. User can edit and delete recorded sets.
7. Deleted sets resequence visible set numbers.
8. User can view workout history.
9. User can view details of one workout.
10. User can view exercise history.
11. User can see last record for an exercise.
12. User can see best weight for an exercise.
13. User can record bodyweight.
14. User can edit/delete bodyweight records.
15. Bodyweight date collisions are handled safely.
16. User can export all app data to JSON backup.
17. User can import a valid backup file.
18. App warns before import replaces current data.
19. Failed import does not partially replace existing data.
20. App works without internet connection.
21. App uses kilograms only.
22. App runs as standalone Android APK without Expo Go.
23. App does not include analytics, tracking, ads, backend, or login in v1.

---

## 16. Reference Document Map

Codex should read this PRD first, then read the specific detailed document for the task being implemented.

| Document Role | Use When |
|---|---|
| Requirement Document | Understanding MVP scope, functional requirements, NFRs, and acceptance criteria. |
| System Design | Understanding architecture, source structure, write queue, backup lifecycle, migrations, and testing strategy. |
| Database Design | Implementing SQLite schema, migrations, repositories, transactions, constraints, indexes, backup mapping, and tests. |
| UI Flow and Screen Design | Implementing navigation, screen behavior, user flows, confirmations, stale workout behavior, bodyweight collision flow, and tradeoffs. |
| Component Design | Implementing React Native components, state boundaries, active workout state, input isolation, timer lifecycle, and rendering rules. |
| Implementation Plan | Following the phase-by-phase build order and quality gates. |

Rule:

```text
If there is a conflict between this PRD and a detailed design document,
ask for clarification before changing locked architecture or data rules.
```

---

## 17. Codex Guardrails

Codex must not:

1. Add backend, login, cloud sync, analytics, ads, AI, nutrition, or social features.
2. Change the SQLite schema unless the task explicitly says to do so.
3. Remove or weaken SQLite constraints.
4. Remove the `workout_exercises` table.
5. Make `workout_sets` depend only on `workout_id` and `exercise_id`.
6. Add `UNIQUE(workout_id, exercise_id)`.
7. Remove the single-active-workout partial unique index.
8. Calculate `MAX(set_number) + 1` outside the insert transaction.
9. Batch workout set writes for later persistence.
10. Show unsaved sets as saved.
11. Ignore `WorkoutWriteQueue` for active workout writes.
12. Skip transaction safety for delete/resequence or reorder operations.
13. Change bodyweight to allow multiple records per date.
14. Implement bodyweight edit-date collision by updating source date before deleting target.
15. Store active workout TextInput values globally in the parent screen.
16. Remove local `SetInputForm` submit guard.
17. Let autofill overwrite touched local input.
18. Implement timer with leaking intervals or listeners.
19. Persist timer ticks to SQLite.
20. Change backup format without updating validators, transformers, fixtures, and import tests.
21. Delete historical backup fixtures.
22. Add unnecessary permissions.
23. Use Expo Go as final runtime assumption.
24. Hide raw database errors directly in UI.

---

## 18. Recommended Codex Workflow

Use Codex in small, reviewable steps.

Recommended loop:

```text
1. Give Codex one focused task.
2. Mention the relevant design document.
3. State the files or area it may modify.
4. State guardrails explicitly.
5. Ask it to add/update tests if applicable.
6. Review the diff.
7. Run tests/typecheck/lint.
8. Commit only after the task passes.
```

Avoid prompts like:

```text
Build the whole app.
```

Prefer prompts like:

```text
Implement the SQLite migration runner and initial schema based on Database Design.
Do not implement UI yet.
Do not change table names or constraints.
Add tests for schema creation and default exercise seeding.
```

---

## 19. Suggested Initial Codex Prompt

Use this when starting the repository implementation:

```text
You are helping implement Gym Progress Tracker v1.

Read the PRD and Codex Project Brief first.
Then use the current System Design, Database Design, UI Flow and Screen Design, Component Design, and Implementation Plan as the source of truth.

Implement only the requested task.
Do not redesign the app.
Do not add backend, login, cloud sync, analytics, AI, nutrition, social features, or advanced analytics.
Do not change locked database constraints or backup format unless explicitly asked.
Keep changes small and reviewable.
Add or update tests when the task touches database logic, validation, backup, concurrency, or critical UI behavior.
Explain the changed files and any tradeoffs after implementation.
```

---

## 20. PRD Summary

Gym Progress Tracker v1 is an offline-first Android mobile app for fast workout logging, simple progress review, bodyweight tracking, and safe local backup.

The most important product decisions are:

- Keep v1 simple and personal-use focused.
- Prioritize fast workout input.
- Save each set immediately.
- Use SQLite as the local source of truth.
- Use stable string IDs.
- Support repeated exercise blocks.
- Protect active workout writes with queue + transactions.
- Preserve data through migrations and backup fixtures.
- Use safe replace-style import.
- Avoid backend, login, cloud sync, analytics, ads, and unnecessary permissions.
- Build the final app as an Android standalone APK.

This PRD is ready to guide Codex without letting it accidentally redesign the product.
