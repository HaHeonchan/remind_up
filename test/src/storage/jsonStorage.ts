import { LocalStorageService } from './localStorage';
import { Reminder } from '../types/reminder';
import { User } from '../types/user';
import { ChatSession } from '../types/chat';

export class JsonStorageService {
  private storage: LocalStorageService;
  
  // Storage keys
  private static readonly REMINDERS_KEY = 'reminders';
  private static readonly USERS_KEY = 'users';
  private static readonly CHAT_SESSIONS_KEY = 'chat_sessions';
  private static readonly CURRENT_USER_KEY = 'current_user';

  constructor() {
    this.storage = LocalStorageService.getInstance();
  }

  // Reminders
  public saveReminders(reminders: Reminder[]): void {
    this.storage.setItem(JsonStorageService.REMINDERS_KEY, reminders);
  }

  public getReminders(): Reminder[] {
    return this.storage.getItem<Reminder[]>(JsonStorageService.REMINDERS_KEY) || [];
  }

  public saveReminder(reminder: Reminder): void {
    const reminders = this.getReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    this.saveReminders(reminders);
  }

  public deleteReminder(id: string): void {
    const reminders = this.getReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);
    this.saveReminders(filteredReminders);
  }

  // Users
  public saveUsers(users: User[]): void {
    this.storage.setItem(JsonStorageService.USERS_KEY, users);
  }

  public getUsers(): User[] {
    return this.storage.getItem<User[]>(JsonStorageService.USERS_KEY) || [];
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.saveUsers(users);
  }

  public getCurrentUser(): User | null {
    return this.storage.getItem<User>(JsonStorageService.CURRENT_USER_KEY);
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      this.storage.setItem(JsonStorageService.CURRENT_USER_KEY, user);
    } else {
      this.storage.removeItem(JsonStorageService.CURRENT_USER_KEY);
    }
  }

  // Chat Sessions
  public saveChatSessions(sessions: ChatSession[]): void {
    this.storage.setItem(JsonStorageService.CHAT_SESSIONS_KEY, sessions);
  }

  public getChatSessions(): ChatSession[] {
    return this.storage.getItem<ChatSession[]>(JsonStorageService.CHAT_SESSIONS_KEY) || [];
  }

  public saveChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    this.saveChatSessions(sessions);
  }

  public getChatSession(id: string): ChatSession | null {
    const sessions = this.getChatSessions();
    return sessions.find(s => s.id === id) || null;
  }

  public deleteChatSession(id: string): void {
    const sessions = this.getChatSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    this.saveChatSessions(filteredSessions);
  }
}
