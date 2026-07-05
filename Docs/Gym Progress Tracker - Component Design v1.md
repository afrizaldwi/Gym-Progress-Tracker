# Gym Progress Tracker — Component Design

**Document Status:** Draft v1  
**Source Requirement:** Gym Progress Tracker — Requirement Document v1  
**Depends On:** System Design, Database Design, UI Flow and Screen Design  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Date:** 2026-07-05

---

## 1. Purpose

This document defines the React Native component design for **Gym Progress Tracker v1**.

The goal is to convert the approved UI Flow and Screen Design into a buildable component structure without creating performance problems on the active workout screen.

The most important design constraint is this:

```text
The active workout screen must stay fast while the user types weight and reps during a real gym session.
```

Therefore, this document focuses heavily on:

- Active workout state management.
- Input isolation.
- Smart vs dumb component separation.
- Scoped write locking.
- Avoiding full-screen re-renders.
- Reusable UI components.
- Component contracts and responsibilities.

This is not a visual styling document. It defines component responsibilities, data ownership, state boundaries, props, events, and render behavior.

## Revision Focus

Component Design keeps the v1 architecture and fixes React Native lifecycle and event-handling risks that could cause production bugs:

1. `SetInputForm` must use an immediate local submit guard to prevent physical double-tap duplicate submissions before parent lock state updates.
2. `WorkoutTimer` must derive time from `Date.now() - startedAt`, sync after AppState resume, use correct effect dependencies, and clean up intervals/listeners on unmount.
3. Autofill suggestions must not overwrite touched local input values during parent re-renders or store refreshes.

These are component-level safety rules, not new user-facing features.

---

## 2. Component Design Priorities

1. **Fast input during workouts**  
   Typing into weight or reps fields must not re-render the whole Start / Continue Workout screen.

2. **Clear data ownership**  
   Saved data comes from SQLite-backed state. Unsaved typed input stays local to input components.

3. **Scoped state subscription**  
   Components should subscribe only to the data slice they need.

4. **Safe write locking**  
   Block-level and workout-level locks must be represented clearly in components.

5. **No prop-drilling of active workout internals**  
   The screen should not pass every set, input, lock, and handler down many levels.

6. **Simple reusable components**  
   Shared buttons, dialogs, empty states, loading states, and list items should be reused across features.

7. **Offline-first UI clarity**  
   Components should assume local SQLite is the source of truth. They should reload from SQLite after successful writes.

---

## 3. State Management Strategy

## 3.1 Core rule

The app should use a selector-based state pattern for the active workout screen.

Recommended rule:

```text
Saved workout data belongs to a controller/store.
Unsaved TextInput values belong inside the input component.
Write-lock state uses scoped subscriptions.
```

Do not design the active workout screen as one giant component with all state passed through props.

### Bad pattern

```text
StartWorkoutScreen owns:
- all exercise blocks
- all sets
- all input values
- all edit state
- all lock state

Then passes everything down through props.
```

Problem:

```text
Typing one digit into reps can re-render the full workout screen.
```

### Required pattern

```text
StartWorkoutScreen owns screen shell only.
ActiveWorkoutController owns saved workout state and write actions.
ExerciseBlockContainer subscribes only to one block.
SetInputForm owns its own typed input state.
```

---

## 3.2 Recommended active workout state shape

The active workout controller/store should contain saved data and lock data.

```ts
type ActiveWorkoutState = {
  workoutId: string | null;
  workout: WorkoutSummary | null;

  workoutExerciseIds: string[];
  workoutExercisesById: Record<string, WorkoutExerciseViewModel>;
  setsByWorkoutExerciseId: Record<string, WorkoutSetViewModel[]>;

  workoutWriteState: WorkoutWriteState;
  blockWriteStateById: Record<string, BlockWriteState>;

  isReloading: boolean;
  error: string | null;
  staleWriteRecovery: StaleWriteRecoveryState | null;
};
```

### Workout write state

```ts
type WorkoutWriteState =
  | { status: 'idle' }
  | { status: 'savingWorkout'; action: 'finish' | 'discard' | 'addBlock' | 'moveBlock' | 'deleteBlock' };
```

### Block write state

```ts
type BlockWriteState =
  | { status: 'idle' }
  | { status: 'savingSet' }
  | { status: 'editingSet'; setId: string }
  | { status: 'deletingSet'; setId: string }
  | { status: 'recovering' };
```

### Derived selector examples

```ts
selectWorkoutSummary(state)
selectWorkoutExerciseIds(state)
selectExerciseBlock(workoutExerciseId)
selectSetsForBlock(workoutExerciseId)
selectBlockWriteState(workoutExerciseId)
selectHasAnyActiveBlockWrite(state)
selectIsWorkoutScreenLocked(state)
```

---

## 3.3 State ownership rules

| State | Owner | Reason |
|---|---|---|
| Saved workout row | Active workout controller/store | Comes from SQLite. |
| Exercise block order | Active workout controller/store | Comes from SQLite. |
| Saved sets | Active workout controller/store | Comes from SQLite. |
| Workout-level lock | Active workout controller/store | Affects whole screen. |
| Block-level lock | Active workout controller/store | Affects one exercise block plus workout-level actions. |
| Weight input text | `SetInputForm` local state | Avoid full-screen re-renders. |
| Reps input text | `SetInputForm` local state | Avoid full-screen re-renders. |
| Set note input text | `SetInputForm` local state | Avoid full-screen re-renders. |
| Edit set draft values | `SetEditForm` or inline edit component local state | Avoid unrelated re-renders. |
| Dialog open/close state | Local screen/component state unless global confirmation is required | Dialog state is temporary UI state. |
| Snackbar message | Screen-level or shared snackbar host | Temporary UI feedback. |

---

## 3.4 Active workout controller responsibilities

The active workout controller is the smart layer for the Start / Continue Workout screen.

It should expose:

```ts
type ActiveWorkoutController = {
  loadActiveWorkout(): Promise<void>;
  reloadWorkout(): Promise<void>;

  addSet(input: AddSetInput): Promise<Result<void>>;
  editSet(input: EditSetInput): Promise<Result<void>>;
  deleteSet(input: DeleteSetInput): Promise<Result<void>>;

  addExerciseBlock(input: AddExerciseBlockInput): Promise<Result<AddExerciseBlockResult>>;
  addExerciseAsNewBlock(input: AddExerciseBlockInput): Promise<Result<void>>;
  moveExerciseBlock(input: MoveExerciseBlockInput): Promise<Result<void>>;
  deleteExerciseBlock(input: DeleteExerciseBlockInput): Promise<Result<void>>;

  finishWorkout(input: FinishWorkoutInput): Promise<Result<void>>;
  discardWorkout(input: DiscardWorkoutInput): Promise<Result<void>>;

  recoverFromStuckWrite(): Promise<void>;
};
```

It should not own unsaved input text for every set form.

---

## 4. Smart vs Dumb Component Separation

## 4.1 Smart components

Smart components are connected to hooks, controllers, stores, SQLite-backed data, navigation, or write actions.

| Smart Component | Responsibility |
|---|---|
| `HomeScreen` | Load home summary, active workout state, and stale workout card. |
| `StartWorkoutScreen` | Screen shell for active workout. Provides controller/store context. |
| `ActiveWorkoutControllerProvider` | Loads active workout state and exposes actions. |
| `ExerciseBlockContainer` | Subscribes to one exercise block and passes data to presentational block UI. |
| `ExerciseSelectionScreen` | Searches exercises and handles duplicate-exercise selection flow. |
| `WorkoutHistoryScreen` | Loads workout history list. |
| `WorkoutDetailScreen` | Loads one completed workout detail. |
| `ExerciseDetailScreen` | Loads exercise history, last record, and best weight. |
| `BodyRecordScreen` | Loads body records and handles add/edit/delete flows. |
| `SettingsBackupScreen` | Handles export/import actions and confirmation flows. |

---

## 4.2 Dumb components

Dumb components are presentational. They receive props and emit events. They should not query SQLite directly.

| Dumb Component | Responsibility |
|---|---|
| `AppButton` | Standard button with loading and disabled states. |
| `AppTextInput` | Standard text input wrapper. |
| `ConfirmDialog` | Reusable destructive or important confirmation dialog. |
| `EmptyState` | Reusable empty-state display. |
| `LoadingState` | Reusable loading display. |
| `ErrorState` | Reusable error display with retry action. |
| `WorkoutTimer` | Displays derived active workout timer. |
| `WorkoutInfoCard` | Displays workout date, title, notes, timer/stale label. |
| `StaleWorkoutCard` | Displays stale workout summary and safe actions. |
| `ExerciseBlockCard` | Visual block layout for one exercise. |
| `ExerciseBlockHeader` | Exercise name, summary, and menu trigger. |
| `SetRow` | Displays one saved set. |
| `SetInputForm` | Local input for new set. |
| `SetEditForm` | Local input for editing existing set. |
| `ExerciseListItem` | Displays exercise in lists. |
| `BodyRecordListItem` | Displays one bodyweight record. |
| `BackupActionCard` | Displays export/import actions. |
| `WriteRecoveryBanner` | Shows stuck-write recovery state. |
| `SnackbarHost` | Shows temporary contextual messages. |

---

## 5. Active Workout Screen Component Hierarchy

The Start / Continue Workout screen is the most performance-sensitive screen.

Recommended hierarchy:

```text
StartWorkoutScreen
  └── ActiveWorkoutControllerProvider
        └── ActiveWorkoutContent
              ├── ActiveWorkoutTopBar
              │     └── WorkoutMenuButton
              ├── WorkoutInfoCard
              │     └── WorkoutTimer / StaleWorkoutAgeLabel
              ├── WriteRecoveryBanner
              ├── AddExerciseButton
              ├── ExerciseBlockList
              │     └── ExerciseBlockContainer(workoutExerciseId)
              │           └── ExerciseBlockCard
              │                 ├── ExerciseBlockHeader
              │                 │     └── ExerciseBlockMenu
              │                 ├── SetList
              │                 │     └── SetRow
              │                 │           └── SetRowMenu / SetEditForm
              │                 └── SetInputForm
              └── FinishWorkoutButton
```

---

## 5.1 `StartWorkoutScreen`

### Type

Smart screen component.

### Responsibilities

- Read navigation params.
- Mount `ActiveWorkoutControllerProvider`.
- Render screen shell.
- Handle top-level loading and missing workout states.
- Avoid owning individual set input values.

### Should not do

- Should not own all set form values.
- Should not pass full workout state through many props.
- Should not directly execute SQL.

---

## 5.2 `ActiveWorkoutControllerProvider`

### Type

Smart provider/controller boundary.

### Responsibilities

- Load active workout from repository.
- Store saved workout data.
- Store write lock states.
- Expose actions to child containers.
- Coordinate `WorkoutWriteQueue` operations.
- Reload from SQLite after successful writes.
- Provide recovery behavior for stuck writes.

### Render rule

The provider should expose selector hooks so child components subscribe only to the state they need.

Example:

```ts
const block = useActiveWorkoutSelector(
  state => state.workoutExercisesById[workoutExerciseId]
);
```

Avoid this pattern:

```ts
const entireWorkoutState = useActiveWorkoutState();
```

inside every child component.

---

## 5.3 `ActiveWorkoutContent`

### Type

Smart layout component.

### Responsibilities

- Subscribe to high-level screen state only.
- Render top bar, workout info card, block list, and finish button.
- Disable workout-level actions when required.

### Subscribes to

```text
workout summary
workoutExerciseIds
workoutWriteState
hasAnyActiveBlockWrite
isReloading
staleWriteRecovery
```

It should not subscribe to every set row value.

---

## 5.4 `ExerciseBlockList`

### Type

Light smart list component.

### Responsibilities

- Render exercise block IDs.
- Use `FlatList` if the list can become long.
- Pass only `workoutExerciseId` to each `ExerciseBlockContainer`.

### Required render pattern

```tsx
<ExerciseBlockContainer workoutExerciseId={item} />
```

Do not pass full block objects and full set arrays from the parent if the store can provide scoped selectors.

---

## 5.5 `ExerciseBlockContainer`

### Type

Smart scoped container.

### Responsibilities

- Subscribe to one exercise block.
- Subscribe to saved sets for that one block.
- Subscribe to lock state for that one block.
- Provide action handlers for add/edit/delete set.
- Pass data to `ExerciseBlockCard`.

### Subscribes to

```text
workoutExercisesById[workoutExerciseId]
setsByWorkoutExerciseId[workoutExerciseId]
blockWriteStateById[workoutExerciseId]
workoutWriteState
```

### Performance rule

Typing in `SetInputForm` inside one block must not re-render other `ExerciseBlockContainer` instances.

---

## 5.6 `ExerciseBlockCard`

### Type

Dumb presentational component.

### Props

```ts
type ExerciseBlockCardProps = {
  block: WorkoutExerciseViewModel;
  sets: WorkoutSetViewModel[];
  blockWriteState: BlockWriteState;
  isWorkoutLocked: boolean;
  autofillSuggestion: SetAutofillSuggestion;

  onAddSet(input: AddSetDraft): Promise<Result<void>>;
  onEditSet(input: EditSetDraft): Promise<Result<void>>;
  onDeleteSet(setId: string): void;
  onOpenMenu(): void;
};
```

### Responsibilities

- Render header.
- Render saved sets.
- Render set input form.
- Show block-level saving state.
- Disable controls according to lock state.

### Should not do

- Should not query SQLite.
- Should not own saved set arrays.
- Should not calculate database set numbers.

---

## 5.7 `SetInputForm`

### Type

Dumb component with local UI state.

### Responsibilities

- Own local input state for weight, reps, and notes.
- Validate local input before calling `onAddSet`.
- Show autofill suggestion.
- Call parent action only when user taps **Add Set**.
- Clear local state only after successful save.
- Keep typed values after failed save so the user can retry.
- Prevent rapid double-tap submissions with an immediate local submit guard.

### Local state

```ts
type SetInputFormState = {
  weightText: string;
  repsText: string;
  notesText: string;
  touched: {
    weight: boolean;
    reps: boolean;
    notes: boolean;
  };
  localSubmitting: boolean;
};
```

### Props

```ts
type SetInputFormProps = {
  disabled: boolean;
  isSaving: boolean;
  autofillSuggestion: SetAutofillSuggestion;
  onAddSet(input: AddSetDraft): Promise<Result<void>>;
};
```

### Input isolation rule

`weightText`, `repsText`, and `notesText` must not be stored in `StartWorkoutScreen`.

This prevents full-screen re-renders on every keystroke.

### Save flow

```text
User types weight/reps/notes locally
  ↓
User taps Add Set
  ↓
SetInputForm checks local submit guard synchronously
  ↓
SetInputForm validates local values
  ↓
Calls onAddSet({ weight, reps, notes })
  ↓
Parent action writes through WorkoutWriteQueue
  ↓
On success: clear reps/notes and apply next weight suggestion
  ↓
On failure: keep typed values and show retry message
  ↓
Finally: release local submit guard
```

### Immediate local submit guard

`SetInputForm` must not rely only on parent-provided `isSaving` or `disabled` props to prevent duplicate submissions.

Reason:

```text
A rapid physical double-tap can fire two onPress events before React has propagated isSaving=true back down from the parent.
```

Required local guard pattern:

```ts
const submitGuardRef = useRef(false);
const [localSubmitting, setLocalSubmitting] = useState(false);

async function handleAddSetPress() {
  if (submitGuardRef.current) {
    return;
  }

  submitGuardRef.current = true;
  setLocalSubmitting(true);

  try {
    const draft = validateLocalDraft();
    if (!draft.ok) {
      return;
    }

    const result = await onAddSet(draft.data);

    if (result.ok) {
      resetFormAfterSuccessfulSave();
    } else {
      showLocalError(result.error.message);
    }
  } finally {
    submitGuardRef.current = false;
    setLocalSubmitting(false);
  }
}
```

The Add Set button must be disabled when either condition is true:

```text
disabled = disabledFromParent || isSaving || localSubmitting || submitGuardRef.current
```

This local guard prevents duplicate `onAddSet` calls before the parent block lock updates.

---

## 5.8 `SetRow`

### Type

Dumb presentational component.

### Responsibilities

- Display set number, weight, reps, and notes.
- Render edit/delete actions.
- Enter inline edit mode if requested.

### Props

```ts
type SetRowProps = {
  set: WorkoutSetViewModel;
  disabled: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit(input: EditSetDraft): Promise<Result<void>>;
  onDelete(): void;
};
```

### Performance rule

`SetRow` should be memoized where practical. A set row should not re-render just because the user types into another block's `SetInputForm`.

---

## 5.9 `SetEditForm`

### Type

Dumb component with local edit state.

### Responsibilities

- Own draft values while editing a set.
- Validate draft before save.
- Submit through the same write path as add/delete set.
- Keep draft values on failed save.

### Required behavior

```text
Edit Set save uses WorkoutWriteQueue.
Block-level lock is active while edit is saving.
Add/Delete Set for that block is disabled while edit is saving.
Workout-level actions are disabled while edit is saving.
After success, reload block from SQLite.
```

---

## 5.10 `WorkoutTimer`

### Type

Dumb derived display component with internal timer lifecycle management.

### Props

```ts
type WorkoutTimerProps = {
  startedAt: string;
  isWorkoutActive: boolean;
  isWorkoutStale: boolean;
  isWorkoutCompleted: boolean;
  isScreenFocused: boolean;
};
```

### Core rule

The timer display is derived from the current clock and the workout start time:

```text
displayedDuration = Date.now() - startedAt
```

Timer ticks must never be written to SQLite.

### When the timer should run

```ts
const shouldRunTimer =
  isWorkoutActive &&
  !isWorkoutStale &&
  !isWorkoutCompleted &&
  isScreenFocused;
```

If `shouldRunTimer` is false, the component should not create an interval.

### AppState and cleanup rules

React Native may suspend the JavaScript thread when the app goes to the background. Therefore, `WorkoutTimer` must use `AppState` to recalculate immediately when the app returns to the foreground.

It must also clean up all lifecycle resources on unmount or when `shouldRunTimer` changes.

Required pattern:

```ts
useEffect(() => {
  if (!shouldRunTimer) {
    return;
  }

  const updateNow = () => {
    setNow(Date.now());
  };

  updateNow();

  const intervalId = setInterval(updateNow, 1000);

  const appStateSubscription = AppState.addEventListener(
    'change',
    nextState => {
      if (nextState === 'active') {
        updateNow();
      }
    }
  );

  return () => {
    clearInterval(intervalId);
    appStateSubscription.remove();
  };
}, [shouldRunTimer, startedAt]);
```

### Dependency rule

The timer effect must not use an empty dependency array.

Reason:

```text
If the workout becomes stale, completed, hidden, or the screen loses focus, the effect must rerun and clean up the old interval/listener.
```

### Render examples

Active workout:

```text
00:45:12
```

Stale workout:

```text
Started 3 days ago
```

---

## 6. Active Workout Write Lock Design

## 6.1 Lock scopes

The active workout screen has two lock scopes.

### Block-level lock

Used for operations affecting one exercise block:

- Add Set.
- Edit Set.
- Delete Set.
- Resequence sets inside that block.

Effect:

```text
Disable Add/Edit/Delete Set controls in that block.
Keep other blocks readable.
Disable workout-level actions while any block-level write is active.
```

### Workout-level lock

Used for operations affecting the whole workout:

- Finish Workout.
- Discard Workout.
- Add Exercise Block.
- Move Exercise Block.
- Delete Exercise Block.

Effect:

```text
Disable the whole active workout screen.
Disable all exercise block menus.
Disable all SetInputForm and SetRow actions.
Show Saving... or action-specific loading state.
```

---

## 6.2 Lock intersection rule

Workout-level actions must be disabled while any block-level write is active.

```text
if hasAnyActiveBlockWrite:
  disable Finish Workout
  disable Discard Workout
  disable Add Exercise
  disable Move Exercise Block
  disable Delete Exercise Block
```

Reason:

```text
The app must not let a workout become completed while a set insert/edit/delete is still resolving.
```

---

## 6.3 Lock state clearing rule

Every write action must clear lock state inside `finally` after success or failure.

Required pattern:

```ts
setBlockWriteState(blockId, { status: 'savingSet' });

try {
  await workoutWriteQueue.enqueue(() => repository.addSet(input));
  await reloadExerciseBlock(blockId);
} catch (error) {
  showError(error);
} finally {
  setBlockWriteState(blockId, { status: 'idle' });
}
```

---

## 6.4 Stuck-write recovery

A write may hang due to an unexpected adapter issue or unhandled promise problem.

The UI must not silently unlock after a timeout because the SQLite write may still be running.

Required behavior:

```text
0–8 seconds:
  Show Saving...

After timeout:
  Show recovery state:
  "Still saving. Please wait or reload workout."

Recovery action:
  Re-query SQLite.
  Check WorkoutWriteQueue has no active operation.
  Reload active workout state.
  Clear stale lock only after reconciliation.
```

Components involved:

```text
WriteRecoveryBanner
ActiveWorkoutControllerProvider
WorkoutWriteQueue status selector
```

---

## 7. Input Isolation Design

## 7.1 Why input isolation is required

On the active workout screen, the user may type many small values quickly:

```text
20
12
25
10
```

If each keystroke updates the parent screen state, the entire workout screen can re-render and cause input lag on lower-end Android devices.

Therefore:

```text
TextInput draft values stay inside the form component until submit.
```

---

## 7.2 `SetInputForm` isolation rules

`SetInputForm` must own:

- `weightText`
- `repsText`
- `notesText`
- field touched state
- local validation message

It receives from parent:

- `disabled`
- `isSaving`
- `autofillSuggestion`
- `onAddSet`

It should not receive:

- full workout state
- all exercise blocks
- all sets in the workout
- unrelated lock states

---

## 7.3 Autofill component behavior

The parent/container provides a suggestion object. The input form decides how to display or apply it.

```ts
type SetAutofillSuggestion =
  | { type: 'none' }
  | { type: 'lastHistorical'; weight: number; label: string }
  | { type: 'previousSet'; weight: number; label: string }
  | { type: 'previousBlock'; weight: number; label: string };
```

Rules:

```text
Set 1:
  Use last historical weight if available.
  If no history, fields stay blank.

Set 2+:
  Use previous set weight in the same block.

Repeated exercise block:
  Prefer previous set in same block.
  Then previous block of same exercise in active workout.
  Then historical record.
```

Do not auto-fill `0 kg` when no history exists.

### Autofill hydration rule

`SetAutofillSuggestion` may hydrate `weightText` only when doing so cannot overwrite user input.

Allowed hydration moments:

```text
1. SetInputForm mounts and touched.weight === false.
2. Form resets after a successful Add Set.
3. User explicitly chooses a future "Use suggestion" action.
```

Forbidden hydration moments:

```text
- touched.weight === true
- user is actively typing
- parent re-renders
- block data reloads
- unrelated store state changes
```

Required behavior:

```text
If touched.weight is true:
  never replace weightText from a new suggestion prop.

After successful save:
  reset touched flags
  apply the next suggestion if available
  keep reps blank
```

This prevents parent refreshes or SQLite reloads from overwriting unsaved local input.

---

## 8. Home Screen Components

## 8.1 Component hierarchy

```text
HomeScreen
  ├── HomeHeader
  ├── ActiveWorkoutCard / StaleWorkoutCard
  ├── LatestWorkoutSummaryCard
  ├── RecentExerciseProgressCard
  └── LatestBodyweightCard
```

---

## 8.2 `ActiveWorkoutCard`

### Type

Dumb presentational component.

### Props

```ts
type ActiveWorkoutCardProps = {
  workoutTitle: string | null;
  startedAt: string;
  setCount: number;
  exerciseCount: number;
  onContinue: () => void;
};
```

### Behavior

- Shows **Continue Workout** when active workout is not stale.
- Shows basic set/exercise count.
- Does not show destructive actions directly unless stale.

---

## 8.3 `StaleWorkoutCard`

### Type

Dumb presentational component.

### Props

```ts
type StaleWorkoutCardProps = {
  startedAt: string;
  staleAgeLabel: string;
  setCount: number;
  exerciseCount: number;
  recommendedAction: 'discard' | 'finish';
  onContinue: () => void;
  onFinish: () => void;
  onDiscard: () => void;
};
```

### Behavior

If `setCount === 0`:

```text
Primary: Discard
Secondary: Continue
```

If `setCount > 0`:

```text
Primary: Finish Workout
Secondary: Continue
Destructive secondary: Discard
```

Discard confirmation must include exact set count:

```text
This will delete 15 recorded sets and cannot be undone.
```

---

## 9. Exercise Selection Components

## 9.1 Component hierarchy

```text
ExerciseSelectionScreen
  ├── ExerciseSearchBar
  ├── MuscleGroupFilterChips
  ├── ExerciseList
  │     └── ExerciseListItem
  └── AddCustomExerciseButton
```

---

## 9.2 Duplicate exercise selection behavior

When the user selects an exercise already in the active workout:

```text
Navigate directly to latest existing block.
Show snackbar:
"Jumped to existing block. [Add as New Block]"
```

Permanent fallback:

```text
Exercise Block Menu → Add as New Block
```

### Components involved

```text
ExerciseSelectionScreen
SnackbarHost
ExerciseBlockMenu
```

---

## 10. Exercise Block Menu Components

## 10.1 `ExerciseBlockMenu`

### Type

Dumb presentational menu component.

### Menu items

```text
Add as New Block
Move Up
Move Down
Delete Block
```

### Disabled states

Disable all menu items when:

```text
workoutWriteState !== idle
or hasAnyActiveBlockWrite === true
```

Disable Move Up when block is already first.
Disable Move Down when block is already last.

Delete Block must show confirmation if the block has sets.

---

## 11. Workout History Components

## 11.1 Component hierarchy

```text
WorkoutHistoryScreen
  ├── WorkoutHistoryHeader
  ├── WorkoutHistoryList
  │     └── WorkoutHistoryItem
  └── EmptyState
```

## 11.2 `WorkoutHistoryItem`

### Props

```ts
type WorkoutHistoryItemProps = {
  workoutId: string;
  workoutDate: string;
  title: string | null;
  exerciseCount: number;
  setCount: number;
  onPress: () => void;
};
```

### Behavior

- Sorted newest first.
- Opens Workout Detail screen.

---

## 12. Workout Detail Components

## 12.1 Component hierarchy

```text
WorkoutDetailScreen
  ├── WorkoutDetailHeader
  ├── WorkoutDetailNotesCard
  ├── WorkoutExerciseDetailList
  │     └── WorkoutExerciseDetailCard
  │           └── ReadOnlySetRow
  └── DeleteWorkoutButton
```

### Rules

- Completed workout detail is read-mostly.
- Editing workout notes/date can be exposed if required.
- Set rows should be read-only unless the user explicitly enters edit mode from workout detail.

---

## 13. Exercise Screens Components

## 13.1 Exercise list / management hierarchy

```text
ExerciseManagementScreen
  ├── ExerciseSearchBar
  ├── MuscleGroupFilterChips
  ├── ExerciseManagementList
  │     └── ExerciseManagementItem
  └── AddCustomExerciseButton
```

## 13.2 `ExerciseManagementItem`

### Props

```ts
type ExerciseManagementItemProps = {
  exercise: ExerciseViewModel;
  canEdit: boolean;
  canDelete: boolean;
  isArchived: boolean;
  onOpenDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
};
```

### Rules

- Default exercises are view-only in v1.
- Custom exercises can be edited.
- Used exercises should be archived instead of deleted.
- Delete unused custom exercise only after confirmation.

---

## 13.3 Exercise detail hierarchy

```text
ExerciseDetailScreen
  ├── ExerciseDetailHeader
  ├── ExerciseSummaryStatsCard
  ├── LastRecordCard
  ├── BestWeightCard
  └── ExerciseHistoryList
        └── ExerciseHistoryItem
```

---

## 14. Body Record Components

## 14.1 Component hierarchy

```text
BodyRecordScreen
  ├── BodyRecordHeader
  ├── BodyRecordForm
  ├── BodyRecordHistoryList
  │     └── BodyRecordListItem
  └── ConfirmDialog
```

---

## 14.2 `BodyRecordForm`

### Type

Dumb form component with local state.

### Local state

```ts
type BodyRecordFormState = {
  recordDate: string;
  bodyWeightText: string;
  notesText: string;
};
```

### Props

```ts
type BodyRecordFormProps = {
  mode: 'create' | 'edit';
  initialValue?: BodyRecordViewModel;
  isSaving: boolean;
  onSubmit(input: BodyRecordDraft): Promise<Result<void>>;
};
```

### Rules

- Own typed values locally.
- Validate bodyweight locally before submit.
- Parent handles same-date collision logic.
- Keep typed values if save fails.

---

## 14.3 Bodyweight same-date collision components

The screen/controller must handle two collision cases:

1. Add record with date that already exists.
2. Edit record date to a date that already exists.

### Edit-date collision transaction

If user edits July 4 record to July 5 and July 5 already exists:

```text
Show confirmation:
"A record already exists for this date. Replace it?"

If confirmed:
BEGIN TRANSACTION
  DELETE existing target-date record
  UPDATE source record to target date, bodyweight, and notes
COMMIT
```

### Component involvement

```text
BodyRecordScreen
BodyRecordForm
ConfirmDialog
```

---

## 15. Backup Components

## 15.1 Component hierarchy

```text
SettingsBackupScreen
  ├── BackupWarningCard
  ├── BackupActionCard(export)
  ├── BackupActionCard(import)
  ├── BackupStatusMessage
  └── ConfirmDialog
```

## 15.2 `BackupActionCard`

### Props

```ts
type BackupActionCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
};
```

### Rules

- Export button should show loading while export is being prepared.
- Import button should show validation/loading state.
- Import confirmation must be explicit because replace import is destructive.

---

## 16. Shared Components

## 16.1 `AppButton`

### Props

```ts
type AppButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};
```

### Rules

- Shows loading state if `loading = true`.
- Disabled button must not call `onPress`.
- Danger variant used for delete, discard, archive confirmation actions.

---

## 16.2 `ConfirmDialog`

### Props

```ts
type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
```

### Required use cases

- Delete workout.
- Discard workout.
- Delete exercise block with sets.
- Delete set.
- Delete body record.
- Replace body record date collision.
- Import backup replace confirmation.

---

## 16.3 `WriteRecoveryBanner`

### Props

```ts
type WriteRecoveryBannerProps = {
  visible: boolean;
  message: string;
  isReloading: boolean;
  onReloadWorkout: () => void;
};
```

### Behavior

- Appears only when a write is taking unusually long.
- Does not blindly unlock the UI.
- Reload action must reconcile state from SQLite before clearing stale locks.

---

## 16.4 `SnackbarHost`

### Props

```ts
type SnackbarAction = {
  label: string;
  onPress: () => void;
};

type SnackbarMessage = {
  message: string;
  action?: SnackbarAction;
};
```

### Required use case

Duplicate exercise selection:

```text
Jumped to existing block. [Add as New Block]
```

---

## 17. Folder Structure

Recommended component folder structure:

```text
src/
  features/
    workouts/
      screens/
        HomeScreen.tsx
        StartWorkoutScreen.tsx
        WorkoutHistoryScreen.tsx
        WorkoutDetailScreen.tsx
      components/
        ActiveWorkoutCard.tsx
        StaleWorkoutCard.tsx
        WorkoutInfoCard.tsx
        WorkoutTimer.tsx
        StaleWorkoutAgeLabel.tsx
        ExerciseBlockCard.tsx
        ExerciseBlockHeader.tsx
        ExerciseBlockMenu.tsx
        SetRow.tsx
        SetInputForm.tsx
        SetEditForm.tsx
        WriteRecoveryBanner.tsx
      containers/
        ActiveWorkoutControllerProvider.tsx
        ActiveWorkoutContent.tsx
        ExerciseBlockContainer.tsx
      hooks/
        useActiveWorkoutController.ts
        useActiveWorkoutSelector.ts
        useWorkoutTimer.ts
      state/
        activeWorkoutStore.ts
        activeWorkoutSelectors.ts

    exercises/
      components/
        ExerciseSearchBar.tsx
        MuscleGroupFilterChips.tsx
        ExerciseListItem.tsx
        ExerciseManagementItem.tsx
        ExerciseForm.tsx

    bodyRecords/
      components/
        BodyRecordForm.tsx
        BodyRecordListItem.tsx

    backup/
      components/
        BackupActionCard.tsx
        BackupWarningCard.tsx
        BackupStatusMessage.tsx

  shared/
    components/
      AppButton.tsx
      AppTextInput.tsx
      ConfirmDialog.tsx
      EmptyState.tsx
      LoadingState.tsx
      ErrorState.tsx
      SnackbarHost.tsx
```

---

## 18. Rendering and Performance Rules

## 18.1 Active workout screen rules

- Do not store set input values in `StartWorkoutScreen`.
- Do not pass full workout object through every component.
- Use block IDs to render block containers.
- Each block container subscribes to its own block and sets.
- Memoize presentational components where practical.
- Use stable callbacks where practical.
- Use list virtualization if exercise blocks or history lists grow.

## 18.2 TextInput rules

- `SetInputForm` owns typed text locally.
- `SetInputForm` must use a local submit guard to prevent rapid duplicate `onPress` submissions.
- `SetEditForm` owns edit draft locally.
- `BodyRecordForm` owns typed bodyweight locally.
- Do not update SQLite or global state on every keystroke.
- Submit only on explicit user action.
- Autofill suggestions must not overwrite touched local input values.

## 18.3 Timer rules

- Timer is derived client-side from `Date.now() - startedAt`.
- Timer does not write to SQLite.
- Timer should update only the timer component, not the whole workout screen.
- Stale workout should display age/status instead of a huge running timer.
- Timer must use `AppState` to recalculate immediately after returning from background.
- Timer effect must depend on `shouldRunTimer` and `startedAt`, not an empty dependency array.
- Timer must return early when `shouldRunTimer` is false.
- Timer must call `clearInterval(intervalId)` during cleanup.
- Timer must call `appStateSubscription.remove()` during cleanup.
- Timer must stop when workout becomes stale, completed, hidden, or the screen loses focus.

---

## 19. Component Testing Strategy

## 19.1 Unit tests

Recommended tests:

- `SetInputForm` validates empty weight/reps.
- `SetInputForm` blocks rapid double-tap duplicate submissions with local submit guard.
- `SetInputForm` keeps typed values after failed save.
- `SetInputForm` clears values after successful save.
- `SetInputForm` does not let new autofill suggestions overwrite touched weight input.
- `SetEditForm` uses local draft state.
- `WorkoutTimer` displays derived duration.
- `WorkoutTimer` does not display normal timer for stale workout.
- `WorkoutTimer` recalculates on AppState active resume.
- `WorkoutTimer` clears interval and removes AppState listener on unmount.
- `WorkoutTimer` stops interval when `shouldRunTimer` becomes false.
- `StaleWorkoutCard` prioritizes discard when set count is zero.
- `StaleWorkoutCard` prioritizes finish when set count is greater than zero.
- `ConfirmDialog` renders destructive copy.
- `BodyRecordForm` keeps typed values after failed save.

## 19.2 Integration tests

Recommended tests:

- Typing in one `SetInputForm` does not reset another block's input.
- Rapid double tap on Add Set produces only one repository call.
- Parent autofill prop update does not overwrite touched local input.
- Add Set disables only that exercise block and workout-level actions.
- Edit Set disables that block and workout-level actions.
- Finish Workout is disabled while any block write is active.
- Duplicate exercise selection shows snackbar action.
- Snackbar Add as New Block calls append-new-block flow.
- Bodyweight edit-date collision shows confirmation before transaction.
- Stuck write shows recovery banner instead of silently unlocking.

## 19.3 Manual performance tests

Test on a lower-end Android phone if available:

- Type quickly in weight and reps fields.
- Add sets repeatedly.
- Scroll through multiple exercise blocks.
- Edit a set while other blocks exist.
- Delete a set and verify resequencing.
- Continue workout after app restart.

---

## 20. Known Component Tradeoffs

### 20.1 Selector-based state adds complexity

Using scoped selectors is more complex than a single parent state object.

Accepted because:

```text
The active workout screen must avoid full-screen re-renders during input.
```

### 20.2 Local input state can temporarily differ from SQLite

Typed values are local until the user taps Add Set.

Accepted because:

```text
Unsaved text is not real workout data yet.
SQLite remains the source of truth after save.
```

### 20.3 Local submit guard duplicates parent lock behavior

`SetInputForm` has a local submit guard even though the parent also exposes `isSaving`.

Accepted because:

```text
The local guard closes the small double-tap window before parent state can propagate back down.
```

### 20.4 WorkoutTimer owns lifecycle complexity

`WorkoutTimer` needs `AppState`, interval cleanup, and dependency-aware effects.

Accepted because:

```text
The timer must stay accurate after background/resume without leaking intervals or draining battery.
```

### 20.5 Snackbar is transient

The user may miss the **Add as New Block** snackbar.

Accepted because:

```text
The same action remains permanently available in the Exercise Block Menu.
```

### 20.6 Insert Set Above is not included

Version 1 only appends sets to the end of an exercise block.

Accepted because:

```text
Insert Set Above requires shifting set numbers upward safely and adds UI complexity.
It may be added in a future version.
```

---

## 21. Component Design Summary

Component Design prioritizes fast workout logging, safe state boundaries, and React Native lifecycle correctness.

The most important decisions are:

- Use selector-based active workout state.
- Separate smart containers from dumb UI components.
- Keep unsaved TextInput values local to form components.
- Protect submit actions with local synchronous guards.
- Prevent autofill suggestions from overwriting touched input.
- Make `ExerciseBlockContainer` subscribe only to one block.
- Use two-tier lock state: block-level and workout-level.
- Disable workout-level actions while any block write is active.
- Use recovery UI for stuck writes instead of blindly unlocking.
- Keep timer derived on the client side only.
- Make `WorkoutTimer` AppState-aware and cleanup-safe.
- Keep destructive confirmations explicit.
- Use snackbar for contextual duplicate-exercise feedback.

This component design is ready to guide React Native implementation without sacrificing real gym input performance or creating avoidable React Native lifecycle bugs.
