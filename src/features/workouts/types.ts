export type WorkoutStatus = 'in_progress' | 'completed';

export type Workout = {
  completedAt: string | null;
  createdAt: string;
  id: string;
  notes: string | null;
  startedAt: string;
  status: WorkoutStatus;
  title: string | null;
  updatedAt: string;
  workoutDate: string;
};
