import { JsonStorageService } from '../storage/jsonStorage';
import { Reminder, CreateReminderData, UpdateReminderData } from '../types/reminder';

export class ReminderService {
  private storage: JsonStorageService;
  
  constructor() {
    this.storage = new JsonStorageService();
  }

  public async createReminder(data: CreateReminderData): Promise<Reminder> {
    const reminder: Reminder = {
      id: this.generateId(),
      ...data,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 클라이언트에 저장
    this.storage.saveReminder(reminder);
    
    // 서버에도 동기화 (API를 통해)
    try {
      await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reminder', data: reminder })
      });
    } catch (error) {
      console.error('서버 동기화 실패:', error);
    }
    
    return reminder;
  }

  public async getReminders(): Promise<Reminder[]> {
    return this.storage.getReminders();
  }

  public async getReminder(id: string): Promise<Reminder | null> {
    const reminders = await this.getReminders();
    return reminders.find(r => r.id === id) || null;
  }

  public async updateReminder(id: string, data: UpdateReminderData): Promise<Reminder | null> {
    const existingReminder = await this.getReminder(id);
    if (!existingReminder) {
      return null;
    }

    const updatedReminder: Reminder = {
      ...existingReminder,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // 클라이언트에 저장
    this.storage.saveReminder(updatedReminder);
    
    // 서버에도 동기화 (API를 통해)
    try {
      await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reminder', data: updatedReminder })
      });
    } catch (error) {
      console.error('서버 동기화 실패:', error);
    }
    
    return updatedReminder;
  }

  public async deleteReminder(id: string): Promise<boolean> {
    const existingReminder = await this.getReminder(id);
    if (!existingReminder) {
      return false;
    }

    // 클라이언트에서 삭제
    this.storage.deleteReminder(id);
    
    // 서버에서도 삭제 (API를 통해)
    try {
      await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deleteReminder', data: { id } })
      });
    } catch (error) {
      console.error('서버 동기화 실패:', error);
    }
    
    return true;
  }

  public async getRemindersByDate(date: string): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    return reminders.filter(r => r.date === date);
  }

  public async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return reminders.filter(r => {
      const reminderDate = new Date(r.date);
      return reminderDate >= today && reminderDate <= futureDate && !r.isCompleted;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public async getCompletedReminders(): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    return reminders.filter(r => r.isCompleted);
  }

  public async toggleReminderCompletion(id: string): Promise<Reminder | null> {
    const reminder = await this.getReminder(id);
    if (!reminder) {
      return null;
    }

    return this.updateReminder(id, { isCompleted: !reminder.isCompleted });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
