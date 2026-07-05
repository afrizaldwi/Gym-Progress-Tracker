# Gym Progress Tracker — UI Flow and Screen Design

**Document Status:** Draft v1  
**Source Requirement:** Gym Progress Tracker — Requirement Document v1  
**Depends On:** System Design and Database Design  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Date:** 2026-07-05

---

## 1. Purpose

This document defines the revised user interface flow and screen design for **Gym Progress Tracker v1**.

The app is designed for a beginner gym user who needs to record workouts quickly during real gym sessions, review previous exercise performance, track bodyweight, and protect local data through manual JSON backup.

This is not a visual style guide. It focuses on:

- Screen behavior.
- Navigation flow.
- User state management.
- Active workout safety.
- Fast set logging.
- Confirmation dialogs.
- Error and recovery states.
- UI behavior that matches the corrected database design.

### 1.1 corrections

This update keeps the safety model and adds the final UI/data-integrity corrections before Component Design:

1. Adds a client-derived live workout timer on the active workout screen.
2. Stops showing a normal live timer once a workout becomes stale; stale workouts show age/status instead.
3. Strictly defines bodyweight edit-date collision handling with a safe transaction sequence.
4. Documents the append-only set limitation for v1.
5. Defers **Insert Set Above** to a future version.

The decisions remain active: stale-workout protection, set-count-aware discard, retroactive stale completion, contextual auto-fill, two-tier write locking, lock-intersection rules, stuck-write recovery, duplicate-exercise snackbar, and **Add as New Block** as a permanent menu fallback.

---

## 2. UI Design Priorities

1. **Fast input during workouts**  
   Recording a set should require minimal taps.

2. **Data safety visibility**  
   The UI must not show a set as saved before SQLite confirms the write.

3. **Beginner-friendly structure**  
   The app should avoid complex gym terminology unless needed.

4. **Clear unfinished-workout handling**  
   The user must be able to continue, finish, or discard an unfinished workout without being trapped.

5. **Safe destructive actions**  
   Delete, discard, archive, and import-replace actions must show confirmation.

6. **Compact workout screen**  
   The active workout screen should avoid unnecessary modals and permanent extra buttons that consume vertical space.

7. **Offline-first clarity**  
   Normal app use does not require internet, so the UI should not show unnecessary network status.

8. **Simple progress review**  
   Version 1 should show last record, best weight, and history lists. Advanced charts are not included.

---

## 3. Navigation Model

### 3.1 Main tabs

Recommended main tabs:

```text
Home
Workouts
Exercises
Body
Settings
```

### 3.2 Navigation tree

```text
Root
  └── Main Tabs
        ├── Home
        │     └── Start Workout / Continue Workout
        │           └── Exercise Selection
        │                 └── Add Custom Exercise
        │
        ├── Workouts
        │     └── Workout Detail
        │
        ├── Exercises
        │     ├── Exercise Detail
        │     └── Exercise Management / Add Custom Exercise
        │
        ├── Body
        │
        └── Settings
              └── Backup Import Confirmation
```

### 3.3 Navigation rules

- The user should always be able to reach the active workout from the Home screen.
- If an active workout exists, the Home screen primary action should be **Continue Workout**, not **Start Workout**.
- If an active workout is stale, the Home screen should show a special stale-workout card.
- The Start / Continue Workout screen should always expose a **Discard Workout** action in the top-right menu.
- The active workout screen should not be buried behind many steps.
- Settings should contain backup features because import/export is not part of daily workout logging.

---

## 4. Screen List

| Screen | Purpose | Priority |
|---|---|---|
| Home Screen | Quick entry point, active workout state, and recent summary. | Must-have |
| Start / Continue Workout Screen | Record workout in real time. | Must-have |
| Exercise Selection Screen | Add an exercise to active workout. | Must-have |
| Add / Edit Custom Exercise Screen | Create or edit custom exercises. | Must-have / Should-have |
| Workout History Screen | View completed workouts. | Must-have |
| Workout Detail Screen | View one completed workout. | Must-have |
| Exercise List Screen | Browse exercises. | Must-have |
| Exercise Detail Screen | View progress for one exercise. | Must-have |
| Exercise Management Screen | Manage custom/default exercises. | Should-have |
| Body Record Screen | Add and review bodyweight. | Must-have |
| Settings / Backup Screen | Export and import backup. | Must-have |

---

## 5. Home Screen

### 5.1 Purpose

The Home screen gives the user quick access to workout tracking and recent progress.

It also protects the user from stale active workouts by making it clear whether an unfinished workout contains saved sets.

### 5.2 Main content

```text
Header
  App name
  Date or simple greeting

Primary Action Card
  If no active workout:
    Start Workout button
  If active workout exists and is not stale:
    Continue Workout button
  If active workout exists and is stale:
    Stale Active Workout card

Latest Workout Summary
  Last completed workout date
  Workout title or default label
  Exercise count
  Set count

Recent Exercise Progress
  Recently trained exercises
  Last used weight/reps summary

Latest Bodyweight
  Latest bodyweight record
  Date
```

### 5.3 Normal primary button logic

```text
If active workout exists:
  Button text: Continue Workout
  On tap: Open active workout

If no active workout exists:
  Button text: Start Workout
  On tap: Create or return active workout through getOrCreateActiveWorkout()
```

### 5.4 Stale active workout definition

A workout is considered stale when:

```text
status = in_progress
AND started_at is older than 24 hours
```

This threshold is a UI behavior rule, not a database rule.

### 5.5 Stale active workout card

If an active workout is older than 24 hours, show a card instead of a normal Continue-only button.

Card content:

```text
Unfinished workout from 2 July 2026
5 exercises • 15 recorded sets
Started at 18:30
```

### 5.6 Stale workout actions when `set_count === 0`

If the stale workout contains zero recorded sets:

```text
Primary action:
  Continue Workout

Secondary action:
  Discard Workout
```

Reason:

- There is no recorded training data to protect.
- Discard is still destructive because it deletes the workout shell, but the risk is low.

Confirmation text:

```text
Discard this empty workout?
No sets were recorded. This will remove the unfinished workout.

[Discard Workout]
[Cancel]
```

### 5.7 Stale workout actions when `set_count > 0`

If the stale workout contains recorded sets:

```text
Primary action:
  Finish Workout

Secondary actions:
  Continue Workout
  Discard Workout
```

Reason:

- Recorded sets are valuable data.
- The UI should guide the user toward preserving the workout, not deleting it.

Discard confirmation must include exact recorded data count:

```text
Discard this workout?
This will delete 15 recorded sets and cannot be undone.

[Discard Workout]
[Cancel]
```

### 5.8 Stale workout finish behavior

If the user finishes a stale workout from the Home screen, the app should compute `completed_at` instead of using the current time.

Rule:

```text
If stale workout has sets:
  completed_at = latest workout_set.created_at

If stale workout has no sets:
  completed_at = workout.started_at
```

The confirmation dialog must show the computed end time.

Example when sets exist:

```text
Finish this workout?
The workout end time will be set to the last recorded set:
2 July 2026, 19:42.

[Finish Workout]
[Cancel]
```

Example when no sets exist:

```text
Finish this empty workout?
No sets were recorded. The end time will match the start time.

[Finish Workout]
[Cancel]
```

For zero-set stale workouts, the UI should prefer **Discard Workout** over **Finish Workout**.

### 5.9 Known limitation of retroactive completion

Using the latest set `created_at` is an approximation.

Example limitation:

```text
User logs Set 1 immediately.
User trains for 60 minutes without logging more sets.
User forgets to finish.
Later, app backdates completed_at to Set 1's created_at.
Workout duration appears too short.
```

This is acceptable for v1 because accurate workout duration analytics are out of scope. Version 1 prioritizes preserving recorded sets and keeping the UI simple.

### 5.10 Empty state

If there is no workout history:

```text
No workouts yet.
Start your first workout and record your first set.
```

If there is no bodyweight record:

```text
No bodyweight record yet.
Add your first bodyweight record from the Body tab.
```

### 5.11 Error state

If the app fails to load local data:

```text
Could not load your local data.
Try restarting the app.
```

Avoid showing raw SQLite errors on the Home screen.

---

## 6. Start / Continue Workout Screen

### 6.1 Purpose

This is the most important screen in the app. It allows the user to record a workout while training.

The screen must be fast, compact, and safe against accidental data loss.

### 6.2 Layout structure

```text
Top Bar
  Back button
  Workout date
  Live workout timer or stale age label
  Finish button
  More menu

Workout Info Card
  Workout title field
  Started time
  Live session duration when not stale
  Notes field, collapsed or optional

Add Exercise Button

Exercise Blocks
  Exercise Block 1
  Exercise Block 2
  Exercise Block 3

Bottom Safe Area
  Optional Finish Workout button for long screens
```

### 6.3 Top-right menu

The Start / Continue Workout screen must include a top-right menu.

Menu actions:

```text
Edit Workout Info
Discard Workout
```

Future optional actions:

```text
Move Exercise Blocks
Show Workout Summary
```

### 6.4 Discard Workout action

Discarding an active workout deletes:

- Workout row.
- Exercise blocks inside that workout.
- Sets inside those blocks.

If `set_count === 0`, use standard confirmation:

```text
Discard this empty workout?
No sets were recorded. This will remove the unfinished workout.

[Discard Workout]
[Cancel]
```

If `set_count > 0`, use stronger destructive confirmation:

```text
Discard this workout?
This will delete 15 recorded sets and cannot be undone.

[Discard Workout]
[Cancel]
```

### 6.5 Workout info

Fields:

- Workout date.
- Optional title.
- Optional notes.

Default title behavior:

```text
If user does not enter title:
  Show generated label such as "Workout — 5 July 2026"
```

### 6.6 Live workout timer

The active workout screen should show a session timer while the workout is not stale.

Recommended display:

```text
Workout Timer: 00:45:12
Started: Today, 18:10
```

Timer rule:

```text
displayed_timer = current_time - workout.started_at
```

Important implementation rule:

```text
The timer is UI-derived only.
Do not write timer ticks to SQLite.
Do not update workout.updated_at every second.
```

Reason:

- A visible timer reminds the user that a workout is actively being recorded.
- It helps reduce stale-workout abandonment.
- Client-side calculation avoids unnecessary database writes and battery cost.

### 6.7 Timer behavior for stale workouts

If the active workout is older than 24 hours, stop presenting the timer as a normal running workout timer.

Instead, show stale status text:

```text
Started 3 days ago
15 recorded sets
```

Reason:

A value like `72:14:30` can look broken and may make the user less confident in the app. Stale workouts should guide the user toward Continue, Finish, or Discard actions instead of pretending the session is still normal.

### 6.8 Exercise block layout

Each exercise block should show:

```text
Exercise name
Muscle group
Previous / best summary, if available
Set list
Set input form
Exercise block menu
```

Example:

```text
Chest Press Machine
Last: 20 kg x 10    Best: 25 kg

Set 1    20 kg x 12       Edit   Delete
Set 2    20 kg x 10       Edit   Delete

Weight [ 20 ] kg     Reps [  ]
[ Add Set ]
```

### 6.9 Exercise block menu

Each exercise block should have a compact menu.

Actions:

```text
Add as New Block
Move Up
Move Down
Delete Block
```

Rules:

- **Add as New Block** appends the same exercise as a new block at the bottom of the workout.
- **Move Up / Move Down** are optional for v1, but if implemented, they must use the safe reorder transaction from Database Design.
- **Delete Block** should show confirmation, especially if the block has sets.

Delete Block confirmation if block has sets:

```text
Delete this exercise block?
This will delete 3 recorded sets from this block.

[Delete Block]
[Cancel]
```

### 6.10 Set input behavior

Required flow:

```text
User enters weight and reps
  ↓
User taps Add Set
  ↓
Button becomes disabled / loading
  ↓
Repository writes set immediately through WorkoutWriteQueue + transaction
  ↓
If success:
    Set appears in list
    Input is prepared for next set
  ↓
If failure:
    Set does not appear as saved
    Show controlled error
```

### 6.11 Contextual auto-fill behavior

Auto-fill should help the user remember previous training weight without encouraging lazy duplicate reps.

#### Set 1 auto-fill

When recording the first set in an exercise block:

```text
If historical record exists for this exercise:
  Auto-fill weight from latest historical set record
  Keep reps empty
  Show helper text: Last time: 20 kg x 12

If no historical record exists:
  Leave weight empty
  Leave reps empty
  Show helper text: No previous record yet
```

Do not auto-fill `0 kg` when no history exists. `0 kg` can look like a real recommendation and may confuse the user.

#### Set 2+ auto-fill

When recording the second or later set in the same exercise block:

```text
Auto-fill weight from previous set in the same block
Keep reps empty
```

#### Repeated exercise block priority

If the same exercise appears multiple times in the same active workout:

```text
Priority 1: Previous set in the same exercise block
Priority 2: Previous block of the same exercise in the same active workout
Priority 3: Latest historical completed workout record
Priority 4: Blank fields
```

### 6.12 Save state

The UI must distinguish:

```text
Saving...
Saved
Failed
Still saving / recovery needed
```

Recommended behavior:

- Disable Add Set while save is running.
- Do not optimistically display the set as saved before SQLite confirms.
- If save fails, keep the user's typed weight and reps in the input fields.
- After success, reload the exercise block from SQLite.

### 6.13 Write lock tiers

The screen must support two lock scopes.

#### Block-level lock

Used for operations that affect one exercise block:

```text
Add Set
Edit Set
Delete Set
Resequence sets inside that block
```

While a block-level lock is active:

- Disable Add/Edit/Delete Set actions in that block.
- Keep other blocks readable.
- Disable workout-level actions until the block write resolves.

#### Workout-level lock

Used for operations that affect the whole workout:

```text
Finish Workout
Discard Workout
Add Exercise Block
Move Exercise Block
Delete Exercise Block
```

While a workout-level lock is active:

- Disable all set inputs.
- Disable all exercise block menus.
- Disable Finish and Discard buttons.
- Show a screen-level saving indicator or disabled state.

### 6.14 Lock state intersection

Workout-level actions must be disabled while any block-level write is active.

Rule:

```text
If any blockWriteState !== idle:
  Disable Finish Workout
  Disable Discard Workout
  Disable Add Exercise
  Disable Move Exercise Block
  Disable Delete Exercise Block
```

Reason:

```text
A set insert may still be pending.
The user should not be able to complete or discard the workout until that write resolves.
```

### 6.15 Stuck-write recovery

A write should normally resolve quickly. However, the UI must not permanently lock if a repository promise hangs or fails to reject cleanly.

Required rules:

```text
Every write must clear lock state in finally after success or failure.
A watchdog should detect long-running writes.
A long-running write must enter recovery state, not silently unlock.
```

Recommended watchdog threshold:

```text
8–10 seconds
```

Recovery state text:

```text
Still saving. Please wait...
```

Recovery actions:

```text
Retry refresh
Reload workout
```

Reload workout behavior:

```text
1. Re-query SQLite for the active workout.
2. Re-query exercise blocks and sets.
3. Check that WorkoutWriteQueue has no active operation.
4. Only then clear stale lock state.
```

Do not blindly force `blockWriteState = idle` while a write may still be running.

### 6.16 Edit Set flow

```text
User taps Edit on a set
  ↓
Inline edit form or modal opens
  ↓
User changes weight, reps, or notes
  ↓
User taps Save
  ↓
Save uses WorkoutWriteQueue
  ↓
Block-level lock is active
  ↓
Repository updates set
  ↓
Exercise block reloads from SQLite
```

Edit form fields:

- Weight.
- Reps.
- Notes.

Do not normally allow editing `set_number` in v1.

Append-only set limitation:

```text
Version 1 supports appending new sets to the end of an exercise block.
Version 1 does not support inserting a forgotten set above or between existing sets.
```

If the user forgets to log an earlier warm-up set, they can either:

- Append it at the end, or
- Manually edit existing set values.

This is a known v1 tradeoff. **Insert Set Above** is deferred to a future version because it requires shifting all later `set_number` values upward inside a safe transaction.

### 6.17 Delete Set flow

```text
User taps Delete on a set
  ↓
Confirmation dialog appears
  ↓
User confirms
  ↓
Delete uses WorkoutWriteQueue
  ↓
Repository deletes set and resequences remaining sets in transaction
  ↓
Exercise block reloads
```

Confirmation text:

```text
Delete this set?
This action cannot be undone.
```

After deletion, visible set numbers should remain compact:

```text
Before: Set 1, Set 2, Set 3
Delete: Set 2
After:  Set 1, Set 2
```

### 6.18 Add Exercise button

Button text:

```text
+ Add Exercise
```

On tap:

```text
Open Exercise Selection Screen
```

This is a workout-level mutation entry point and should be disabled while any block-level write is active.

### 6.19 Repeated exercise selection behavior

If the user selects an exercise that already exists in the workout:

```text
Default:
  Navigate directly to the latest existing block
  Scroll/focus that block
  Show snackbar with Add as New Block action
```

Snackbar:

```text
Jumped to existing block.  [Add as New Block]
```

If the user taps snackbar action:

```text
Append same exercise as a new block
Scroll to new block
```

Permanent fallback:

```text
Exercise Block Menu → Add as New Block
```

This avoids a modal during the fast path but keeps repeated-block support discoverable.

### 6.20 Exercise block reordering

For v1, full drag-and-drop reordering is optional.

Simple v1 option:

```text
Do not include drag-and-drop in the first build.
Keep exercise order based on add order.
```

Better v1 option if time allows:

```text
Exercise Block Menu:
  Move Up
  Move Down
```

Move Up / Move Down should:

- Run inside a transaction.
- Use positive parking order values.
- Reload the workout after success.

### 6.21 Finish Workout flow

Normal active workout finish:

```text
User taps Finish Workout
  ↓
If any block-level write is active:
    Finish button is disabled
  ↓
If workout has no sets:
    Show warning
  ↓
If workout has sets:
    Confirm if needed
  ↓
Set workout status to completed
  ↓
completed_at = current time for non-stale finish
  ↓
Navigate to Workout Detail or Workout History
```

Empty-workout warning:

```text
Finish workout without any sets?
You can also discard this workout if you do not need it.

[Finish Anyway]
[Cancel]
```

Stale workout finish from Home uses computed `completed_at` as defined in Section 5.8.

### 6.22 Back button behavior

If user presses back while workout is in progress:

```text
Do not mark workout as completed.
Return to Home.
Workout remains available through Continue Workout.
```

This supports closing and reopening the app during training.

---

## 7. Exercise Selection Screen

### 7.1 Purpose

Allows the user to select an exercise when adding to the active workout.

### 7.2 Layout structure

```text
Top Bar
  Back button
  Title: Add Exercise

Search Input

Muscle Group Filter
  All / Chest / Back / Shoulder / Legs / Biceps / Triceps / Core / Other

Exercise List
  Exercise item
  Exercise item
  Exercise item

Add Custom Exercise Button
```

### 7.3 Exercise item

Each item should show:

```text
Exercise name
Muscle group
Equipment type
Last record preview, if available
```

Example:

```text
Lat Pulldown
Back • Cable Machine
Last: 30 kg x 10
```

### 7.4 Selection flow

```text
User taps exercise
  ↓
App checks whether same exercise already exists in active workout
  ↓
If not exists:
  Add exercise block
  Return to Start Workout screen
  Scroll to new block

If exists:
  Return to Start Workout screen
  Scroll to latest existing block
  Show snackbar: Jumped to existing block. [Add as New Block]
```

### 7.5 Snackbar behavior

Snackbar is temporary. If the user misses it, the same action remains available from:

```text
Exercise Block Menu → Add as New Block
```

This is an accepted tradeoff because it keeps the screen compact and avoids interrupting the common flow.

### 7.6 Search behavior

- Search should filter by exercise name.
- Muscle group filter should combine with search.
- Archived exercises should be hidden by default.

### 7.7 Empty state

If no exercise matches:

```text
No exercises found.
Try another keyword or add a custom exercise.
```

---

## 8. Add / Edit Custom Exercise Screen

### 8.1 Purpose

Allows the user to create or edit a custom exercise.

### 8.2 Fields

```text
Exercise name
Muscle group
Equipment type
```

### 8.3 Validation

| Field | Rule |
|---|---|
| Exercise name | Required |
| Muscle group | Required |
| Equipment type | Optional |

### 8.4 Create flow

```text
User taps Add Custom Exercise
  ↓
Form opens
  ↓
User fills name and muscle group
  ↓
User taps Save
  ↓
Custom exercise is created
  ↓
Return to previous screen
```

### 8.5 Edit flow

Only custom exercises should be editable in v1.

```text
User opens custom exercise
  ↓
User taps Edit
  ↓
Form opens
  ↓
User saves changes
```

### 8.6 Default exercise behavior

Default exercises should not be editable in v1.

Message:

```text
Default exercises cannot be edited in version 1.
You can create a custom exercise instead.
```

---

## 9. Workout History Screen

### 9.1 Purpose

Allows the user to review completed workouts.

### 9.2 Layout structure

```text
Top Bar
  Title: Workout History

Workout List
  Workout card
  Workout card
  Workout card
```

### 9.3 Workout card

Each card should show:

```text
Workout date
Workout title
Exercise count
Set count
Optional notes preview
```

Example:

```text
5 July 2026
Push Day
4 exercises • 12 sets
```

### 9.4 Sorting

Workouts should be sorted newest first.

### 9.5 Empty state

```text
No completed workouts yet.
Start a workout from the Home screen.
```

### 9.6 Card action

```text
Tap workout card
  ↓
Open Workout Detail Screen
```

---

## 10. Workout Detail Screen

### 10.1 Purpose

Shows one completed workout with exercises and sets.

### 10.2 Layout structure

```text
Top Bar
  Back button
  Title: Workout Detail

Workout Summary
  Date
  Title
  Notes
  Exercise count
  Set count
  Start time
  End time, if useful

Exercise Blocks
  Exercise name
  Sets
```

### 10.3 Exercise block in detail mode

Detail mode should be read-focused.

Example:

```text
Chest Press Machine
Set 1    20 kg x 12
Set 2    20 kg x 10
Set 3    15 kg x 12
Notes: Strength dropped after second set
```

### 10.4 Edit workout action

Version 1 may include edit workout as should-have.

Possible actions:

```text
Edit title
Edit date
Edit notes
Delete workout
```

Do not encourage editing `completed_at` in v1. Retroactive stale completion uses the latest set timestamp automatically.

### 10.5 Delete workout flow

```text
User taps Delete Workout
  ↓
Confirmation dialog appears
  ↓
User confirms
  ↓
Workout and related exercise blocks/sets are deleted
  ↓
Return to Workout History
```

Confirmation text should include set count:

```text
Delete this workout?
This will delete 15 recorded sets and cannot be undone.

[Delete Workout]
[Cancel]
```

---

## 11. Exercise List Screen

### 11.1 Purpose

Allows the user to browse exercises and open exercise progress details.

### 11.2 Layout structure

```text
Top Bar
  Title: Exercises

Search Input
Muscle Group Filter

Exercise List
  Exercise item
  Exercise item
  Exercise item

Add Custom Exercise Button
```

### 11.3 Exercise item

Each item should show:

```text
Exercise name
Muscle group
Equipment
Last record preview, if available
```

Example:

```text
Lat Pulldown
Back • Cable Machine
Last: 30 kg x 10
```

### 11.4 Tap behavior

```text
Tap exercise item
  ↓
Open Exercise Detail Screen
```

### 11.5 Empty state

```text
No exercises found.
Try changing the search or filter.
```

---

## 12. Exercise Detail Screen

### 12.1 Purpose

Shows progress for one exercise.

### 12.2 Layout structure

```text
Top Bar
  Back button
  Exercise name

Exercise Summary
  Muscle group
  Equipment

Progress Summary
  Last record
  Best weight

History List
  Date group
    Set rows
```

### 12.3 Progress summary

Example:

```text
Last Record
20 kg x 10 — 5 July 2026

Best Weight
25 kg
```

### 12.4 History list

Example:

```text
5 July 2026
Set 1    20 kg x 12
Set 2    20 kg x 10

1 July 2026
Set 1    15 kg x 12
Set 2    15 kg x 12
```

### 12.5 Empty state

If the exercise has never been used:

```text
No history yet.
Use this exercise in a workout to start tracking progress.
```

### 12.6 Advanced charts

Advanced charts are not included in v1. The screen should stay list-and-summary based.

---

## 13. Exercise Management Screen

### 13.1 Purpose

Allows the user to manage exercises.

This screen is separate from Exercise Selection because management actions are not needed during fast workout logging.

### 13.2 Layout structure

```text
Top Bar
  Title: Manage Exercises

Search Input
Muscle Group Filter
Show Archived Toggle

Exercise List
  Exercise item
  Menu

Add Custom Exercise Button
```

### 13.3 Item actions

For default exercise:

```text
View detail
Archive / hide, if allowed by design
```

For custom unused exercise:

```text
Edit
Delete
```

For custom used exercise:

```text
Edit
Archive
```

### 13.4 Delete custom exercise flow

```text
User taps Delete
  ↓
App checks usage
  ↓
If unused:
    Show delete confirmation
    Delete exercise
  ↓
If used:
    Block delete
    Offer archive instead
```

Message for used exercise:

```text
This exercise already has workout history.
It cannot be permanently deleted, but you can archive it so it no longer appears in normal selection.
```

### 13.5 Archive flow

```text
User taps Archive
  ↓
Confirmation dialog appears
  ↓
User confirms
  ↓
Exercise is hidden from normal selection
  ↓
Old workout history remains readable
```

---

## 14. Body Record Screen

### 14.1 Purpose

Allows the user to record and review bodyweight progress.

### 14.2 Layout structure

```text
Top Bar
  Title: Bodyweight

Add Bodyweight Card
  Date
  Bodyweight input
  Notes input
  Save button

Latest Bodyweight Summary

Bodyweight History List
```

### 14.3 Add bodyweight flow

```text
User enters date and bodyweight
  ↓
User taps Save
  ↓
App checks if record_date already exists
  ↓
If not exists:
    Create body record
  ↓
If exists:
    Ask whether to update existing record
```

### 14.4 Same-date dialog

```text
A bodyweight record already exists for this date.
Do you want to update it?

[Update Existing]
[Cancel]
```

### 14.5 History item

Each item should show:

```text
Date
Bodyweight
Notes preview, if available
Edit / Delete action
```

Example:

```text
5 July 2026
72.5 kg
Morning weight
```

### 14.6 Edit body record flow

```text
User taps Edit
  ↓
Form opens with existing data
  ↓
User edits bodyweight, notes, or date
  ↓
User taps Save
```

If the record date is unchanged:

```text
Update the existing body record normally
```

If the record date is changed:

```text
Check whether the target record_date already exists
```

If no target record exists:

```text
Update the source record normally
```

If a target record already exists:

```text
Show confirmation dialog
```

Dialog text:

```text
A bodyweight record already exists for this date.
Replace it with this edited record?

[Replace Existing]
[Cancel]
```

### 14.7 Bodyweight edit-date collision transaction

If the user confirms replacement, the repository must preserve the edited/source record ID and avoid violating `UNIQUE(record_date)`.

Required transaction order:

```text
BEGIN TRANSACTION
  DELETE existing target-date record
  UPDATE source record to the target date, bodyweight, and notes
COMMIT
```

Example:

```text
Existing records:
- July 4 record: br_aaa
- July 5 record: br_bbb

User edits July 4 record and changes date to July 5.

Transaction:
1. DELETE br_bbb
2. UPDATE br_aaa SET record_date = July 5, body_weight = new value, notes = new notes
3. COMMIT
```

If any step fails:

```text
ROLLBACK
Keep both original records unchanged
Show controlled error message
```

Do not update the source record's date before deleting the target record. That would violate the unique date constraint.

### 14.8 Delete body record flow

```text
User taps Delete
  ↓
Confirmation dialog appears
  ↓
User confirms
  ↓
Record is deleted
```

Confirmation text:

```text
Delete this bodyweight record?
This action cannot be undone.
```

### 14.9 Empty state

```text
No bodyweight records yet.
Add your first record to start tracking changes.
```

---

## 15. Settings / Backup Screen

### 15.1 Purpose

Allows the user to export and import backup data.

### 15.2 Layout structure

```text
Top Bar
  Title: Settings

Backup Section
  Export Data button
  Import Data button
  Backup warning message

App Info Section
  App version
  Backup format version
  Database schema version, optional
```

### 15.3 Backup warning message

```text
Your workout and bodyweight data is stored locally on this device.
Export a backup regularly and keep the file somewhere safe.
```

### 15.4 Export flow

```text
User taps Export Data
  ↓
App reads local data
  ↓
App builds backup JSON envelope
  ↓
App writes backup file
  ↓
System share/export sheet opens
  ↓
User saves or shares backup file
```

### 15.5 Export success message

```text
Backup exported successfully.
Keep the file somewhere safe.
```

### 15.6 Import flow

```text
User taps Import Data
  ↓
App recommends exporting current data first
  ↓
User selects JSON file
  ↓
App parses file
  ↓
App validates backup envelope
  ↓
App transforms old backup version if supported
  ↓
App validates transformed data
  ↓
App shows destructive confirmation
  ↓
User confirms
  ↓
App replaces local data inside transaction
  ↓
Success message appears
```

### 15.7 Import warning dialog

```text
Import backup?

This will replace all current data on this device.
If you have new data, export it first.

[Import and Replace]
[Cancel]
```

### 15.8 Import failure message

```text
Could not import this backup.
The file may be invalid, unsupported, or damaged.
Your current data was not changed.
```

### 15.9 Newer backup version message

```text
This backup was created by a newer version of the app.
Update the app before importing this file.
```

### 15.10 Old backup version message

If transformer exists:

```text
This backup was created by an older version of the app.
The app will update the backup format during import.
```

If transformer does not exist:

```text
This backup version is too old or unsupported.
Your current data was not changed.
```

---

## 16. Common UI Components

### 16.1 Buttons

Recommended button types:

| Button Type | Use Case |
|---|---|
| Primary | Start Workout, Continue Workout, Finish Workout, Add Set, Save |
| Secondary | Add Exercise, Add Custom Exercise, Export Data |
| Danger | Discard Workout, Delete Workout, Delete Set, Import and Replace |
| Text | Cancel, Back |

### 16.2 Confirmation dialog

Used for:

- Finish stale workout.
- Discard workout.
- Delete workout.
- Delete exercise block.
- Delete set.
- Delete body record.
- Delete unused exercise.
- Archive exercise.
- Import and replace data.

Dialog structure:

```text
Title
Short explanation
Primary destructive / confirm action
Cancel action
```

### 16.3 Snackbar / toast

Used for temporary contextual actions that should not interrupt the workout flow.

Primary v1 use:

```text
Jumped to existing block.  [Add as New Block]
```

Rules:

- Snackbar should not block the user.
- Snackbar action should execute immediately if tapped.
- Important actions must also exist in a permanent place if the snackbar disappears.

### 16.4 Empty state

Used when a list has no content.

Structure:

```text
Short title
Helpful explanation
Optional action button
```

### 16.5 Loading state

Use small loading indicators for:

- Add Set saving.
- Edit Set saving.
- Delete Set saving.
- Workout-level actions.
- Backup export.
- Backup import.
- Initial database loading.

Avoid blocking the whole app for normal small reads. Block the whole workout screen only for workout-level mutations.

### 16.6 Error message

Error messages should be readable and not technical.

Bad:

```text
SQLITE_CONSTRAINT_UNIQUE failed
```

Good:

```text
This action could not be saved. Please try again.
```

---

## 17. Main User Flows

### 17.1 First-time app open

```text
Open app
  ↓
Database initializes
  ↓
Default exercises are seeded
  ↓
Home screen appears
  ↓
User taps Start Workout
```

No onboarding screen is required for v1 unless implementation time allows.

### 17.2 Start first workout

```text
Home
  ↓
Start Workout
  ↓
Workout is created as in_progress
  ↓
Start Workout Screen opens
  ↓
User taps Add Exercise
```

### 17.3 Add exercise and record sets

```text
Start Workout Screen
  ↓
Add Exercise
  ↓
Exercise Selection Screen
  ↓
Select Chest Press Machine
  ↓
Exercise block appears
  ↓
If history exists:
    Weight may auto-fill from latest historical record
  ↓
Enter reps
  ↓
Tap Add Set
  ↓
Set is saved immediately
```

### 17.4 Continue workout after closing app

```text
User records sets
  ↓
User closes app before finishing workout
  ↓
User opens app again
  ↓
Home detects in_progress workout
  ↓
Home shows Continue Workout
  ↓
User continues logging sets
```

### 17.5 Handle stale workout with no sets

```text
User starts workout accidentally
  ↓
No sets are recorded
  ↓
User returns after 24+ hours
  ↓
Home shows stale workout card
  ↓
User may Continue or Discard
```

### 17.6 Handle stale workout with recorded sets

```text
User records sets
  ↓
User forgets to finish workout
  ↓
User returns after 24+ hours
  ↓
Home shows stale workout card with set count
  ↓
Primary action is Finish Workout
  ↓
completed_at is set to latest set.created_at
```

### 17.7 Select duplicate exercise

```text
Start Workout Screen
  ↓
Add Exercise
  ↓
Select Bicep Curl
  ↓
If Bicep Curl already exists:
    App scrolls to latest existing Bicep Curl block
    Snackbar appears: Jumped to existing block. [Add as New Block]
```

### 17.8 Finish workout

```text
Start Workout Screen
  ↓
Finish Workout
  ↓
Workout status becomes completed
  ↓
Workout appears in Workout History
```

### 17.9 Review exercise progress

```text
Exercises tab
  ↓
Tap exercise
  ↓
Exercise Detail opens
  ↓
User sees last record, best weight, and history list
```

### 17.10 Export backup

```text
Settings
  ↓
Export Data
  ↓
Share/save backup file
```

### 17.11 Import backup

```text
Settings
  ↓
Import Data
  ↓
Select JSON file
  ↓
Validate and transform backup if needed
  ↓
Show warning
  ↓
Replace local data inside transaction
```

---

## 18. Screen State Requirements

Each main screen should define these states:

| State | Meaning |
|---|---|
| Loading | Data is being loaded from SQLite. |
| Empty | Data loaded successfully but no records exist. |
| Ready | Data loaded and screen is usable. |
| Saving | User action is being written to SQLite. |
| Recovering | A write took too long and the app is reconciling from SQLite. |
| Error | Operation failed with controlled message. |

### 18.1 Workout write states

Recommended state model:

```ts
workoutWriteState = 'idle' | 'savingWorkout' | 'recovering';

blockWriteState[workoutExerciseId] =
  | 'idle'
  | 'addingSet'
  | 'editingSet'
  | 'deletingSet'
  | 'recovering';
```

### 18.2 Lock intersection rule

```text
If any blockWriteState is not idle:
  Disable workout-level actions.

If workoutWriteState is not idle:
  Disable all block-level actions.
```

### 18.3 Important UI rule

For normal set logging, saving state should be local to the exercise block.

For workout-level mutations, the entire active workout screen should be disabled until the operation finishes or enters recovery.

---

## 19. Destructive Action Rules

The following actions require confirmation:

| Action | Confirmation Required | Confirmation Must Mention |
|---|---|---|
| Discard workout with zero sets | Yes | Removes unfinished workout. |
| Discard workout with sets | Yes | Exact recorded set count deleted. |
| Delete workout | Yes | Exact set count if available. |
| Delete exercise block with sets | Yes | Set count inside the block. |
| Delete set | Yes | Action cannot be undone. |
| Delete body record | Yes | Action cannot be undone. |
| Delete unused exercise | Yes | Exercise removed. |
| Archive used exercise | Yes | Exercise hidden but history preserved. |
| Import backup | Yes | All current local data replaced. |

---

## 20. Validation Message Examples

### 20.1 Set input

| Problem | Message |
|---|---|
| Empty weight | Enter weight. |
| Negative weight | Weight cannot be negative. |
| Empty reps | Enter reps. |
| Reps zero or negative | Reps must be greater than zero. |
| Reps decimal | Reps must be a whole number. |

### 20.2 Exercise form

| Problem | Message |
|---|---|
| Empty name | Enter exercise name. |
| Empty muscle group | Choose a muscle group. |

### 20.3 Bodyweight form

| Problem | Message |
|---|---|
| Empty bodyweight | Enter bodyweight. |
| Bodyweight zero or negative | Bodyweight must be greater than zero. |
| Same date exists | A record already exists for this date. |

### 20.4 Backup

| Problem | Message |
|---|---|
| Invalid JSON | This file is not a valid backup file. |
| Unsupported newer version | This backup was created by a newer app version. |
| Failed import | Import failed. Your current data was not changed. |

### 20.5 Write recovery

| Problem | Message |
|---|---|
| Write is taking too long | Still saving. Please wait. |
| Write failed | This action could not be saved. Please try again. |
| Recovery reload needed | Reload workout to check the latest saved data. |

---

## 21. Fast Workout Logging Rules

The app should follow these rules to stay usable during training:

1. Add Set button must be easy to tap.
2. Weight and reps inputs must be visible without opening a separate screen.
3. Set 1 may auto-fill weight from the latest historical record.
4. Set 2+ may auto-fill weight from the previous set in the current block.
5. Reps should stay empty after each save.
6. No-history exercises should show blank input, not `0 kg`.
7. Saving should be immediate.
8. Failed saves should keep the typed input.
9. Continue Workout should be obvious from Home.
10. Stale workouts should show set count and safe actions.
11. The user should not be forced to finish a workout before leaving the screen.
12. Exercise history should be visible but should not interrupt logging.
13. Avoid complex charts or analytics in the workout logging screen.

---

## 22. MVP UI Decisions

| Decision | Status | Reason |
|---|---|---|
| Bottom tabs | Accepted | Simple navigation for beginner user. |
| Home primary action changes based on active workout | Required | Supports continue unfinished workout. |
| Stale workout card after 24 hours | Required | Prevents stale active workout trap. |
| Discard Workout action | Required | Allows user to remove accidental active workouts. |
| Set-count-aware discard warning | Required | Prevents accidental deletion of recorded sets. |
| Retroactive stale finish timestamp | Required | Avoids fake multi-day workout duration. |
| Inline set input inside exercise block | Required | Fastest logging flow. |
| Contextual Set 1 auto-fill | Required | Solves previous-weight memory problem. |
| Add Set waits for SQLite success | Required | Prevents false saved state. |
| Two-tier locking | Required | Prevents block/workout write races. |
| Stuck-write recovery | Required | Prevents permanent UI lock. |
| Duplicate exercise selection uses snackbar | Required | Keeps fast path compact and discoverable. |
| Add as New Block in block menu | Required | Permanent fallback for repeated blocks. |
| Drag-and-drop reordering | Optional | Not required for MVP. |
| Move Up / Move Down | Optional | Safer than full drag-and-drop if reordering is included. |
| Charts | Out of scope | History lists and summaries are enough for v1. |
| Dark mode | Optional | Not required for MVP functionality. |
| Onboarding | Optional | App can be understandable without onboarding. |

---

## 23. Acceptance Mapping

| Requirement Area | UI Coverage |
|---|---|
| Create workout | Home → Start Workout. |
| Continue unfinished workout | Home shows Continue Workout. |
| Stale unfinished workout | Home shows stale workout card. |
| Discard unfinished workout | Home stale card and active workout menu. |
| Add exercise to workout | Start Workout → Exercise Selection. |
| Record sets | Inline set form in exercise block. |
| Immediate set saving | Add Set waits for SQLite success. |
| Edit/delete sets | Set row actions with block-level lock. |
| Workout history | Workouts tab. |
| Workout detail | Workout Detail screen. |
| Exercise history | Exercise Detail screen. |
| Last record / best weight | Exercise Detail summary and workout set auto-fill. |
| Bodyweight tracking | Body tab. |
| Export backup | Settings → Export Data. |
| Import backup | Settings → Import Data with confirmation. |
| Delete used exercise protection | Exercise Management usage check. |
| Archive used exercise | Exercise Management archive flow. |
| Offline-first | No network-dependent UI in v1. |
| Android APK real use | Design prioritizes phone gym usage. |

---

## 24. Known UI Tradeoffs

### 24.1 Retroactive completion can underestimate duration

When a stale workout is completed later, the app uses latest set `created_at` as `completed_at`.

This can underestimate workout duration if the user logs only an early set and then stops logging. This is acceptable for v1 because accurate duration analytics are out of scope.

### 24.2 Snackbar is temporary

The **Add as New Block** snackbar may disappear before the user taps it.

This is acceptable because the same action remains available in the Exercise Block Menu.

### 24.3 Two-tier locking adds implementation complexity

Block-level and workout-level locks make the UI safer but require careful state management.

This is acceptable because it prevents workout completion, discard, and add-block actions from racing against pending set writes.

### 24.4 Sets are append-only in v1

Version 1 does not support inserting a forgotten set above or between existing sets.

Tradeoff:

```text
If the user forgets to log a warm-up set before Set 1,
they cannot insert it later as the new Set 1.
```

Reason:

- Insert-in-middle requires shifting all later `set_number` values upward.
- The shift must avoid immediate `UNIQUE(workout_exercise_id, set_number)` collisions.
- This adds UI and repository complexity beyond the MVP.

Accepted v1 behavior:

- New sets are appended to the end of the exercise block.
- Users may edit existing set values.
- **Insert Set Above** may be added in a future version.

### 24.5 No advanced dashboard

The Home screen only shows simple summaries. This is acceptable for v1 because fast workout logging matters more than analytics.

### 24.6 No full chart system

Exercise progress uses last record, best weight, and history list. This is acceptable because advanced charts are out of scope for v1.

### 24.7 Import flow is intentionally cautious

Import requires validation and confirmation. This adds friction, but backup import can replace all local data, so caution is necessary.

---

## 25. UI Flow Summary

Gym Progress Tracker v1 should use a simple tab-based mobile UI with the active workout flow as the center of the app.

The most important UI decisions are:

- Home clearly shows **Start Workout**, **Continue Workout**, or a stale workout card.
- Stale workouts with recorded sets prioritize **Finish Workout**, not discard.
- Discard confirmations show the exact set count that will be deleted.
- Stale workout completion uses the latest set timestamp instead of the current time.
- Sets are logged inline inside exercise blocks.
- Sets are saved immediately and only shown as saved after SQLite success.
- Set 1 can auto-fill from the latest historical exercise weight.
- Zero-history exercises keep blank inputs.
- Edit/delete/add set operations use block-level write locks.
- Finish/discard/add block operations use workout-level write locks.
- Workout-level actions are disabled while any block write is active.
- Long-running writes enter recovery state instead of permanently locking the UI.
- Duplicate exercise selection jumps to the existing block and shows a snackbar action for adding a new block.
- Active workout screen shows a client-derived live timer for non-stale workouts.
- Stale workouts show age/status instead of a normal long-running timer.
- Set deletion resequences visible set numbers.
- Sets are append-only in v1; Insert Set Above is deferred.
- Bodyweight records allow one record per date.
- Bodyweight edit-date collisions use delete-target-then-update-source transaction order.
- Backup import is cautious and transaction-safe.
- Progress review stays simple: last record, best weight, and history list.

This UI flow is intentionally practical for a beginner gym user using the app during real workouts.
