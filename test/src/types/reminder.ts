export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string; // HH:mm format
  description?: string;
  email: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderData {
  title: string;
  date: string;
  time?: string;
  description?: string;
  email: string;
}

export interface UpdateReminderData extends Partial<CreateReminderData> {
  isCompleted?: boolean;
}
