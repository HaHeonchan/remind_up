import { JsonStorageService } from '../storage/jsonStorage';
import { ServerStorageService } from '../storage/serverStorage';
import { User, CreateUserData, UpdateUserData } from '../types/user';

export class UserService {
  private storage: JsonStorageService;
  private serverStorage: ServerStorageService;
  
  constructor() {
    this.storage = new JsonStorageService();
    this.serverStorage = ServerStorageService.getInstance();
  }

  public async createUser(data: CreateUserData): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
    };

    // 클라이언트에 저장
    this.storage.saveUser(user);
    this.storage.setCurrentUser(user);
    
    // 서버에도 동기화 (API를 통해)
    try {
      await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', data: user })
      });
    } catch (error) {
      console.error('서버 동기화 실패:', error);
    }
    
    return user;
  }

  public async getCurrentUser(): Promise<User | null> {
    return this.storage.getCurrentUser();
  }

  public async updateUser(data: UpdateUserData): Promise<User | null> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const updatedUser: User = {
      ...currentUser,
      ...data,
    };

    // 클라이언트에 저장
    this.storage.saveUser(updatedUser);
    this.storage.setCurrentUser(updatedUser);
    
    // 서버에도 동기화 (API를 통해)
    try {
      await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', data: updatedUser })
      });
    } catch (error) {
      console.error('서버 동기화 실패:', error);
    }
    
    return updatedUser;
  }

  public async logout(): Promise<void> {
    this.storage.setCurrentUser(null);
  }

  public async isLoggedIn(): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    return currentUser !== null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    // 클라이언트에서는 클라이언트 스토리지에서 조회
    const users = this.storage.getUsers();
    return users.find(u => u.email === email) || null;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
