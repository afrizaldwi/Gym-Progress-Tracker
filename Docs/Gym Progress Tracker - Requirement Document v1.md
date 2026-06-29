# Gym Progress Tracker — Requirement Document v1

## 1. Project Overview

**Project Name:** Gym Progress Tracker  
**Platform:** Mobile application first  
**Primary User:** Beginner gym user  
**Development Approach:** Lightweight SDLC  
**Storage Approach:** Offline-first local database with export/import backup  


Gym Progress Tracker is a mobile application designed to help users record gym workouts, track exercise performance, monitor bodyweight progress, and protect their data through manual export and import backup.

The first version focuses on personal use. The application should be simple, fast, and useful during real gym sessions.



## 2. Background

The user has recently started going to the gym and needs a simple way to track workout progress. Manually remembering weights, reps, and sets can become difficult over time, especially when trying to increase strength or compare current performance with previous sessions.

A dedicated gym tracker app can help the user record workout data consistently and review progress over time.



## 3. Problem Statement

Beginner gym users often struggle to remember:

- What exercises they performed previously.

- How much weight they used.

- How many reps and sets they completed.

- Whether their strength is improving.

- How their bodyweight changes over time.

Without a tracking system, progress becomes harder to measure and workout decisions become based on memory instead of data.



## 4. Project Goal

The goal of this project is to create an offline-first mobile application that allows the user to:

- Create workout sessions.

- Add exercises to a workout.

- Record sets, reps, and weight.

- View workout history.

- View exercise progress.

- Track bodyweight.

- Export and import backup data.

The first version should be simple enough to use during gym sessions without slowing down training.



## 5. Target User

The target user for version 1 is:

**A beginner gym user who wants to track workout progress using a simple mobile app.**

For the first version, the application is designed mainly for personal use. Multi-user support, public release, and social features are not included in the MVP.



## 6. MVP Scope

The MVP will include:

- Workout session tracking.

- Exercise list.

- Custom exercise creation.

- Set tracking.

- Workout history.

- Exercise history.

- Bodyweight tracking.

- Simple personal record tracking.

- Export data to JSON backup file.

- Import data from JSON backup file.

The MVP will not include:

- Login and register.

- Cloud database.

- Online synchronization.

- AI workout coach.

- Nutrition tracking.

- Social features.

- Advanced analytics.

- Workout recommendation system.



## 7. Functional Requirements

### 7.1 Workout Management

| Code | Requirement | Priority |
| - | - | - |
| FR-01 | User can create a workout session. | Must-have |
| FR-02 | User can select or use the current date for a workout session. | Must-have |
| FR-03 | User can add notes to a workout session. | Should-have |
| FR-04 | User can view previous workout sessions. | Must-have |
| FR-05 | User can edit a workout session. | Should-have |
| FR-06 | User can delete a workout session after confirmation. | Should-have |
| FR-44 | User can continue an unfinished workout if the app is closed and reopened. | Must-have |



### 7.2 Exercise Management

| Code | Requirement | Priority |
| - | - | - |
| FR-07 | User can view a list of exercises. | Must-have |
| FR-08 | User can view exercises grouped by muscle group. | Must-have |
| FR-09 | User can add custom exercises. | Must-have |
| FR-10 | User can edit custom exercises. | Should-have |
| FR-11 | User can delete custom exercises only if they have never been used in workout history. | Should-have |

Default exercise examples:

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

Exercise data should include:

- Exercise name

- Muscle group

- Equipment type

Example muscle groups:

- Chest

- Back

- Shoulder

- Legs

- Biceps

- Triceps

- Core

- Other



### 7.3 Set Tracking

| Code | Requirement | Priority |
| - | - | - |
| FR-12 | User can add an exercise to a workout session. | Must-have |
| FR-13 | User can input set number, weight, and reps. | Must-have |
| FR-14 | User can add notes for a specific set. | Should-have |
| FR-15 | User can edit recorded sets. | Must-have |
| FR-16 | User can delete recorded sets. | Should-have |

Each set should store:

- Workout ID

- Exercise ID

- Set number

- Weight

- Reps

- Notes

- Created date

- Updated date

Example:

Exercise: Chest Press Machine
Set 1: 20 kg x 12
Set 2: 20 kg x 10
Set 3: 15 kg x 12
Notes: Strength dropped after second set

Set saving behavior:

- Each set should be saved immediately after the user records it.

- The app should not wait until the end of the workout to save all sets.

- This reduces the risk of losing workout data if the app is closed during training.



### 7.4 Workout History

| Code | Requirement | Priority |
| - | - | - |
| FR-17 | User can view all previous workouts sorted by newest first. | Must-have |
| FR-18 | User can open a workout detail page. | Must-have |
| FR-19 | User can see exercises and sets inside a previous workout. | Must-have |

Workout history should help the user answer:

- What did I train last time?

- What exercises did I do?

- What weight and reps did I use?



### 7.5 Exercise Progress Tracking

| Code | Requirement | Priority |
| :-: | :-: | :-: |
| FR-20 | User can view history for one exercise. | Must-have |
| FR-21 | User can see the last record for one exercise. | Must-have |
| FR-22 | User can see best weight used for one exercise. | Should-have |
| FR-23 | User can see simple exercise progress through history records and summaries. | Should-have |

For version 1, progress tracking should stay simple.

The app should show:

- Last workout record.

- Best weight.

- Exercise history by date.

Advanced charts, volume analysis, and weekly/monthly analytics can be added later.



### 7.6 Bodyweight Tracking

| Code | Requirement | Priority |
| :-: | :-: | :-: |
| FR-24 | User can add bodyweight record. | Must-have |
| FR-25 | User can view bodyweight history. | Must-have |
| FR-26 | User can add notes to bodyweight record. | Could-have |
| FR-27 | User can edit bodyweight record. | Should-have |
| FR-28 | User can delete bodyweight record. | Should-have |

Body record data should include:

- Date

- Bodyweight

- Notes

- Created date

- Updated date

Progress photo and waist measurement are not included in version 1.



### 7.7 Export and Import Backup

| Code | Requirement | Priority |
| - | - | - |
| FR-29 | User can export all app data into a JSON backup file. | Must-have |
| FR-30 | User can import data from a JSON backup file. | Must-have |
| FR-31 | App validates the backup file before importing. | Must-have |
| FR-32 | App shows a confirmation warning before import. | Must-have |
| FR-33 | App supports replace-style import for version 1. | Must-have |
| FR-34 | App includes backup version information in exported file. | Must-have |

Exported backup should include:

- Exercises

- Workouts

- Workout sets

- Body records

- Backup version

- Export date

Example backup structure:

\{
  "app\_name": "Gym Progress Tracker",
  "backup\_version": 1,
  "exported\_at": "2026-06-29T10:00:00Z",
  "data": \{
  "exercises": \[\],
  "workouts": \[\],
  "workout\_sets": \[\],
  "body\_records": \[\]
  \}
\}

For version 1, import behavior should be:

Select backup file
Validate backup file
Show warning
Replace current local data
Import backup data
Show success message

Merge import is not included in version 1 because it can create duplicate or conflicting records.



### 7.8 Platform, Data Safety, and App Behavior Requirements

| Code | Requirement | Priority |
| :-: | :-: | :-: |
| FR-35 | App should be built as an Android standalone APK for real phone usage. | Must-have |
| FR-36 | App should not depend on Expo Go as the final runtime. | Must-have |
| FR-37 | App should use kilograms as the only weight unit in version 1. | Must-have |
| FR-38 | App should use stable local string IDs or UUID-style IDs for main records. | Must-have |
| FR-39 | App should use versioned SQLite migrations instead of resetting the database. | Must-have |
| FR-40 | App should not permanently delete exercises that already have workout history. | Must-have |
| FR-41 | App should archive or hide used exercises instead of deleting them. | Must-have |
| FR-42 | App should not collect analytics, tracking data, or upload personal data. | Must-have |
| FR-43 | App should import backup data using a safe transaction so failed imports do not partially replace data. | Must-have |

Additional import safety rules:

```
`- Import should only replace current data after the backup file has passed validation.`

`- Import should run inside a database transaction.`

`- If import fails, the previous local data should remain unchanged.`

`- App should recommend exporting current data before importing a backup.`
```

Additional behavior rules:

```
`Used exercise deletion:`

`- If an exercise has never been used, it can be deleted.`

`- If an exercise already has workout history, it should not be permanently deleted.`

`- Used exercises should be archived or hidden instead.`


`Set input behavior:`

`- When adding a new set, the app may auto-fill the previous set's weight.`

`- This helps the user record sets faster during gym sessions.`


`Platform behavior:`

`- Expo Go may only be used for early temporary testing.`

`- The final version 1 app should run as a standalone Android APK.`
```

## 8. Non-Functional Requirements

| Code | Requirement | Description |
| :-: | :-: | :-: |
| NFR-01 | Offline-first | App must work without internet connection. |
| NFR-02 | Fast input | User should be able to record sets quickly during gym sessions. |
| NFR-03 | Simple interface | The UI should be easy to understand for beginner users. |
| NFR-04 | Local storage | Workout data should be stored locally using SQLite. |
| NFR-05 | Data backup | User should be able to export and import backup data. |
| NFR-06 | Data validation | App should prevent invalid input such as negative weight or reps. |
| NFR-07 | Confirmation before destructive action | Delete and import-replace actions must show confirmation. |
| NFR-08 | Expandable structure | App structure should allow future backend or cloud sync integration. |
| NFR-09 | Mobile-first usability | App should be comfortable to use on a phone during workouts. |
| NFR-10 | Android-first delivery | Version 1 should target Android standalone APK first. |
| NFR-11 | No Expo Go dependency | Final app usage should not require Expo Go. |
| NFR-12 | Safe database migration | Schema changes should use versioned migrations, not database reset. |
| NFR-13 | Stable record identity | Main records should use stable local string IDs or UUID-style IDs. |
| NFR-14 | Minimal permissions | App should request only permissions required for backup import/export. |
| NFR-15 | Privacy-first | App should not include analytics, tracking, or external data upload. |
| NFR-16 | Consistent unit system | Version 1 should use kilograms only for exercise weight and bodyweight. |


## 9. Data Requirements

All main entity IDs should use stable string IDs or UUID-style IDs.

Example:

- exercises.id = ex\_abc123

- workouts.id = wo\_abc123

- workout\_sets.id = set\_abc123

- body\_records.id = br\_abc123

### 9.1 Exercise Entity

exercises
- id
- name
- muscle\_group
- equipment
- is\_custom
- is\_archived
- archived\_at
- created\_at
- updated\_at

Description:

The exercises table stores both default exercises and custom exercises created by the user.

Default exercise seeding rule:

Default exercises should be seeded idempotently using stable IDs so the app does not create duplicate default exercises after database migration, app reinstall, or backup import.



### 9.2 Workout Entity

workouts
- id
- workout\_date
- title
- notes
- status
- started\_at
- completed\_at
- created\_at
- updated\_at

Description:

The workouts table stores workout sessions. One workout can contain multiple exercises and sets.

The status field indicates whether a workout is still in progress or already completed.

Allowed status values:

- in\_progress

- completed



### 9.3 Workout Set Entity

workout\_sets
- id
- workout\_id
- exercise\_id
- set\_number
- weight
- reps
- notes
- created\_at
- updated\_at

Description:

The workout\_sets table stores the actual training records for each exercise inside a workout.



### 9.4 Body Record Entity

body\_records
- id
- record\_date
- body\_weight
- notes
- created\_at
- updated\_at

Description:

The body\_records table stores user bodyweight progress over time.



## 10. Screen Requirements

### 10.1 Home Screen

Purpose:

Give the user quick access to start tracking and view recent progress.

Main content:

- Start workout button.

- Latest workout summary.

- Recent exercise progress.

- Latest bodyweight record.



### 10.2 Start Workout Screen

Purpose:

Allow the user to create and record a workout session.

Main content:

- Workout date.

- Workout title.

- Add exercise button.

- Exercise list inside current workout.

- Set input form.



### 10.3 Exercise Selection Screen

Purpose:

Allow the user to select an exercise when adding to a workout.

Main content:

- Exercise search.

- Exercise list.

- Muscle group filter.

- Add custom exercise button.



### 10.4 Workout History Screen

Purpose:

Allow the user to review previous workout sessions.

Main content:

- List of workout sessions.

- Workout date.

- Workout title.

- Number of exercises.

- Workout detail navigation.



### 10.5 Workout Detail Screen

Purpose:

Show the details of one workout session.

Main content:

- Workout date.

- Workout notes.

- Exercises performed.

- Sets, reps, and weight for each exercise.



### 10.6 Exercise Detail Screen

Purpose:

Show history and progress for one exercise.

Main content:

- Exercise name.

- Muscle group.

- Last record.

- Best weight.

- Exercise history by date.



### 10.7 Body Record Screen

Purpose:

Allow the user to record and view bodyweight progress.

Main content:

- Add bodyweight record.

- Bodyweight history.

- Notes.



### 10.8 Settings / Backup Screen

Purpose:

Allow the user to manage backup and restore actions.

Main content:

- Export data button.

- Import data button.

- Backup warning message.

- App information.



### 10.9 Exercise Management Screen

Purpose:

Allow the user to manage default and custom exercises.

Main content:

- Exercise list

- Muscle group filter

- Add custom exercise button

- Edit custom exercise

- Archive used custom exercise

- Delete unused custom exercise




## 11. Validation Rules

### Workout Validation

- Workout date is required.

- Workout title can be optional.

- Notes can be optional.

- Workout status must be either in\_progress or completed.

- A workout can only have completed\_at filled when the status is completed.

### Exercise Validation

- Exercise name is required.

- Muscle group is required.

- Equipment can be optional.

### Set Validation

- Weight is required.

- Weight must be zero or greater.

- Reps are required.

- Reps must be greater than zero.

- Set number must be greater than zero.

- Weight can support decimal values because gym machines may use 2.5 kg or 7.5 kg increments.

- Reps must be a whole number.

### Body Record Validation

- Record date is required.

- Bodyweight is required.

- Bodyweight must be greater than zero.

### Import Validation

- Backup file must be valid JSON.

- Backup file must contain app\_name.

- Backup file must contain backup\_version.

- Backup file must contain required data sections.

- Unsupported backup versions should not be imported automatically.

- App must show confirmation before replacing current data.



## 12. Assumptions

- The app is used by one user only.

- The app is used mainly on a mobile phone.

- The first version does not require internet connection.

- The first version stores data locally.

- The first version uses manual export/import for backup.

- The user is responsible for storing exported backup files safely.



## 13. Out of Scope for Version 1

The following features are not included in version 1:

- User login.

- User registration.

- Cloud backup.

- Multi-device sync.

- Social sharing.

- AI workout recommendation.

- Nutrition tracker.

- Meal planning.

- Progress photo storage.

- Waist measurement.

- Rest timer.

- RPE tracking.

- Workout templates.

- Automatic workout plan generator.

These features may be considered for future versions after the core tracker is stable.



## 14. Acceptance Criteria

The MVP is considered successful when:

1. User can create a workout session.

2. User can add exercises to the workout.

3. User can record sets, reps, and weight.

4. User can view previous workouts.

5. User can view history for a specific exercise.

6. User can record bodyweight.

7. User can export all local data to a JSON backup file.

8. User can import a valid backup file.

9. App warns the user before replacing current data during import.

10. App works without internet connection.

11. App uses transaction-safe import so failed imports do not partially replace existing data.

12. App can run as a standalone Android APK without Expo Go.

13. App does not require internet for normal workout tracking.

14. If the app is closed during a workout, the recorded sets remain saved and the workout can be continued.



## 15. Future Features

Possible future features:

- Workout templates.

- Rest timer.

- RPE or difficulty tracking.

- Volume calculation.

- Weekly progress summary.

- Monthly progress summary.

- Progress charts.

- Cloud backup.

- Account login.

- Multi-device sync.

- Web dashboard.

- AI-assisted workout review.

- Nutrition tracking.

- Progress photo tracking.



## 16. Recommended Technology Stack

### Version 1 — Offline-First Mobile App

Mobile App:
- React Native
- Expo
- TypeScript

Build Strategy:
- Expo development build for serious development
- Standalone Android APK for real phone usage
- Expo Go only for early temporary testing, not as the final runtime

Local Database:
- SQLite

Backup:
- JSON export/import

Build Tool:
- EAS Build

Version 1 will not use a backend. The application should store workout data locally on the device and support manual backup through export/import.

The app should be built as a real standalone mobile application so it can be installed and used on the phone without depending on the Expo Go app. This is important because the app is intended for real gym usage, offline access, SQLite storage, and long-term personal tracking.



### Future Version — Optional Backend

Backend:
- Golang

API Style:
- REST API

Database:
- PostgreSQL

Authentication:
- JWT-based authentication

Deployment:
- Docker
- VPS or cloud hosting

The backend may be added in a future version when the app needs account login, cloud backup, multi-device synchronization, or a web dashboard.

Golang is selected as the preferred future backend option because this project only needs a lightweight API service for authentication, workout synchronization, backup, and restore. A full backend framework is not required for version 1.



## 17. Development Priority

Recommended development order:

1. Set up React Native Expo project.

2. Create basic navigation.

3. Design SQLite schema.

4. Build exercise list.

5. Build workout creation.

6. Build set input.

7. Build workout history.

8. Build exercise detail history.

9. Build bodyweight tracking.

10. Build export data feature.

11. Build import data feature.

12. Test the app using real workout data.



## 18. Version 1 Summary

Gym Progress Tracker v1 is an offline-first mobile app for recording gym workouts and tracking progress. The main focus is fast workout logging, simple history review, bodyweight tracking, and safe local backup using JSON export/import.

The application should remain simple in version 1 so it can be built quickly and tested during real gym sessions.

## 19. Version 1 Technical Decisions and Constraints

The following technical decisions are locked for version 1 to keep the project focused, safe, and realistic.

### 19.1 Target Platform

Version 1 will target:

```
`Platform:`

`- Android only`


`Build output:`

`- Standalone Android APK`
```

iOS is not included in version 1. The app is designed for personal Android phone usage first.


### 19.2 Expo Usage Decision

The project will use Expo, but the final app should not depend on Expo Go.

```
`Allowed:`

`- Expo for development`

`- Expo development build`

`- EAS Build`

`- Standalone APK`


`Not final runtime:`

`- Expo Go`
```

Expo Go may be used only for early temporary testing. For real gym usage, the app should be installed as a standalone APK.


### 19.3 Unit Decision

Version 1 will use kilograms only.

```
`Exercise weight:`

`- kg`


`Bodyweight:`

`- kg`
```

Pounds, unit switching, and automatic unit conversion are not included in version 1.


### 19.4 Local ID Strategy

Main records should use stable local string IDs or UUID-style IDs instead of relying only on auto-increment database IDs.

Example:

```
`exercise\_id: ex\_abc123`

`workout\_id: wo\_abc123`

`set\_id: set\_abc123`

`body\_record\_id: br\_abc123`
```

This makes the data safer for future export/import and possible backend synchronization.


### 19.5 SQLite Migration Strategy

The app should use versioned SQLite migrations.

The database should not be automatically deleted or reset when the schema changes.

Example:

```
`Database version 1:`

`- exercises`

`- workouts`

`- workout\_sets`

`- body\_records`


`Database version 2 later:`

`- add workout\_templates`
```

This is important because workout history becomes valuable over time and should not be lost during app development.


### 19.6 Backup Strategy

The app will support manual backup using JSON export/import.

Version 1 import behavior:

```
`Import mode:`

`- Replace current local data`


`Not included:`

`- Merge import`

`- Cloud backup`

`- Multi-device sync`
```

Before import, the app must validate the backup file and show a confirmation warning.


### 19.7 Exercise Deletion Strategy

Exercises that already have workout history should not be permanently deleted.

Rules:

```
`If exercise has no workout history:`

`- Allow delete`


`If exercise has workout history:`

`- Block permanent delete`

`- Allow archive or hide instead`
```

This prevents old workout records from becoming broken or unclear.


### 19.8 Privacy and Permissions

Version 1 should avoid unnecessary permissions and external tracking.

The app should not include:

```
`- Analytics`

`- Ads`

`- External tracking`

`- Automatic cloud upload`

`- Account requirement`
```

The app should only request permissions that are required for import/export backup functionality.


### 19.9 Real Usage Testing

The app should be tested during real gym sessions, not only with fake data.

Real usage testing should check:

```
`- Can the user record a set quickly?`

`- Can the user see the previous record easily?`

`- Are buttons easy to tap during workout?`

`- Is the set input flow annoying or slow?`

`- Is data saved correctly after closing the app?`

`- Can backup export/import protect the data?`
```

This project should prioritize actual gym usability over unnecessary features.

