import { Reminder } from '../types/reminder';
import { User } from '../types/user';
import { ChatSession } from '../types/chat';

export class ServerStorageService {
  private static instance: ServerStorageService;
  private dataDir: string;
  
  // Storage keys
  private static readonly REMINDERS_KEY = 'reminders';
  private static readonly USERS_KEY = 'users';
  private static readonly CHAT_SESSIONS_KEY = 'chat_sessions';
  private static readonly CURRENT_USER_KEY = 'current_user';

  private constructor() {
    // 서버 사이드에서만 실행
    if (typeof window === 'undefined') {
      const fs = require('fs').promises;
      const path = require('path');
      this.dataDir = path.join(process.cwd(), 'data');
      this.ensureDataDir(fs);
    } else {
      this.dataDir = '';
    }
  }

  public static getInstance(): ServerStorageService {
    if (!ServerStorageService.instance) {
      ServerStorageService.instance = new ServerStorageService();
    }
    return ServerStorageService.instance;
  }

  private async ensureDataDir(fs: any): Promise<void> {
    if (typeof window !== 'undefined') return; // 클라이언트에서는 실행하지 않음
    
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    if (typeof window !== 'undefined') return ''; // 클라이언트에서는 빈 문자열 반환
    
    const path = require('path');
    return path.join(this.dataDir, `${key}.json`);
  }

  private async readFile<T>(key: string): Promise<T | null> {
    if (typeof window !== 'undefined') return null; // 클라이언트에서는 null 반환
    
    try {
      const fs = require('fs').promises;
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 null 반환
      return null;
    }
  }

  private async writeFile<T>(key: string, data: T): Promise<void> {
    if (typeof window !== 'undefined') return; // 클라이언트에서는 실행하지 않음
    
    const fs = require('fs').promises;
    const filePath = this.getFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Reminders
  public async saveReminders(reminders: Reminder[]): Promise<void> {
    await this.writeFile(ServerStorageService.REMINDERS_KEY, reminders);
  }

  public async getReminders(): Promise<Reminder[]> {
    const reminders = await this.readFile<Reminder[]>(ServerStorageService.REMINDERS_KEY);
    return reminders || [];
  }

  public async saveReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    await this.saveReminders(reminders);
  }

  public async deleteReminder(id: string): Promise<void> {
    const reminders = await this.getReminders();
    const filteredReminders = reminders.filter(r => r.id !== id);
    await this.saveReminders(filteredReminders);
  }

  // Users
  public async saveUsers(users: User[]): Promise<void> {
    await this.writeFile(ServerStorageService.USERS_KEY, users);
  }

  public async getUsers(): Promise<User[]> {
    const users = await this.readFile<User[]>(ServerStorageService.USERS_KEY);
    return users || [];
  }

  public async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    await this.saveUsers(users);
  }

  public async getCurrentUser(): Promise<User | null> {
    return await this.readFile<User>(ServerStorageService.CURRENT_USER_KEY);
  }

  public async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      await this.writeFile(ServerStorageService.CURRENT_USER_KEY, user);
    } else {
      try {
        const filePath = this.getFilePath(ServerStorageService.CURRENT_USER_KEY);
        await fs.unlink(filePath);
      } catch {
        // 파일이 없으면 무시
      }
    }
  }

  // Chat Sessions
  public async saveChatSessions(sessions: ChatSession[]): Promise<void> {
    await this.writeFile(ServerStorageService.CHAT_SESSIONS_KEY, sessions);
  }

  public async getChatSessions(): Promise<ChatSession[]> {
    const sessions = await this.readFile<ChatSession[]>(ServerStorageService.CHAT_SESSIONS_KEY);
    return sessions || [];
  }

  public async saveChatSession(session: ChatSession): Promise<void> {
    const sessions = await this.getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    await this.saveChatSessions(sessions);
  }

  public async getChatSession(id: string): Promise<ChatSession | null> {
    const sessions = await this.getChatSessions();
    return sessions.find(s => s.id === id) || null;
  }

  public async deleteChatSession(id: string): Promise<void> {
    const sessions = await this.getChatSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    await this.saveChatSessions(filteredSessions);
  }
}
