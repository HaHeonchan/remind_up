import { ReminderService } from './reminderService';
import { UserService } from './userService';
import { EmailService } from './emailService';
import { ServerStorageService } from '../storage/serverStorage';
import { Reminder } from '../types/reminder';
import { User } from '../types/user';

export class NotificationService {
  private static instance: NotificationService;
  private reminderService: ReminderService;
  private userService: UserService;
  private emailService: EmailService;
  private serverStorage: ServerStorageService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private sentNotifications: Set<string> = new Set();

  private constructor() {
    this.reminderService = new ReminderService();
    this.userService = new UserService();
    this.emailService = EmailService.getInstance();
    this.serverStorage = ServerStorageService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 서비스 시작 (매 분마다 확인)
   */
  public start(): void {
    if (this.isRunning) {
      console.log('알림 서비스가 이미 실행 중입니다.');
      return;
    }

    console.log('🔔 알림 서비스 시작');
    this.isRunning = true;

    // 즉시 한 번 실행
    this.checkAndSendNotifications();

    // 매 분마다 실행
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60 * 1000); // 1분 = 60초 * 1000ms
  }

  /**
   * 알림 서비스 중지
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🔔 알림 서비스 중지');
  }

  /**
   * 알림 서비스 상태 확인
   */
  public isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 현재 시간에 알림을 보내야 하는 일정들을 확인하고 발송
   */
  public async checkAndSendNotifications(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = this.formatTime(now);
      const currentDate = this.formatDate(now);

      console.log(`🔍 알림 확인 중... (${currentDate} ${currentTime})`);

      // 서버 스토리지에서 모든 사용자 가져오기
      const users = await this.serverStorage.getUsers();
      
      for (const user of users) {
        // 기본적으로 이메일 알림 활성화 (preferences가 없으면 기본값)
        const emailNotifications = true; // 기본값으로 활성화
        const reminderTime = '09:00'; // 기본값
        const advanceNotification = true; // 기본값
        const advanceMinutes = 15; // 기본값

        if (!emailNotifications) {
          continue; // 이메일 알림이 비활성화된 사용자는 건너뛰기
        }

        // 사용자의 알림 시간과 현재 시간이 일치하는지 확인
        if (reminderTime === currentTime) {
          await this.sendDailyReminders(user, currentDate);
        }

        // 특정 일정의 시간과 현재 시간이 일치하는지 확인
        await this.sendSpecificTimeReminders(user, currentDate, currentTime, advanceNotification, advanceMinutes);
      }

    } catch (error) {
      console.error('알림 확인 중 오류 발생:', error);
    }
  }

  /**
   * 사용자의 일일 알림 시간에 맞춰 오늘의 일정들을 발송
   */
  private async sendDailyReminders(user: User, currentDate: string): Promise<void> {
    try {
      // 서버 스토리지에서 일정 가져오기
      const allReminders = await this.serverStorage.getReminders();
      const todayReminders = allReminders.filter(r => r.date === currentDate);
      const userReminders = todayReminders.filter(r => r.email === user.email && !r.isCompleted);

      if (userReminders.length === 0) {
        console.log(`📅 ${user.email}: 오늘 일정이 없습니다.`);
        return;
      }

      const notificationKey = `daily_${user.id}_${currentDate}`;
      if (this.sentNotifications.has(notificationKey)) {
        console.log(`📅 ${user.email}: 오늘 일일 알림을 이미 발송했습니다.`);
        return;
      }

      console.log(`📧 ${user.email}: 일일 알림 발송 중... (${userReminders.length}개 일정)`);
      
      const success = await this.emailService.sendReminderSummary(userReminders, user);
      
      if (success) {
        this.sentNotifications.add(notificationKey);
        console.log(`✅ ${user.email}: 일일 알림 발송 완료`);
      } else {
        console.error(`❌ ${user.email}: 일일 알림 발송 실패`);
      }

    } catch (error) {
      console.error(`일일 알림 발송 중 오류 (${user.email}):`, error);
    }
  }

  /**
   * 특정 시간에 맞춰 개별 일정 알림 발송 (정시 알림 + 사전 알림)
   */
  private async sendSpecificTimeReminders(user: User, currentDate: string, currentTime: string, advanceNotification: boolean, advanceMinutes: number): Promise<void> {
    try {
      // 서버 스토리지에서 일정 가져오기
      const allReminders = await this.serverStorage.getReminders();
      const todayReminders = allReminders.filter(r => r.date === currentDate);
      const userReminders = todayReminders.filter(r => r.email === user.email && !r.isCompleted);

      for (const reminder of userReminders) {
        if (!reminder.time) continue;

        // 1. 정시 알림 (일정 시간에 정확히)
        if (reminder.time === currentTime) {
          await this.sendExactTimeReminder(reminder, user, currentDate, currentTime);
        }

        // 2. 사전 알림 (사용자가 설정한 시간 전에)
        if (advanceNotification && advanceMinutes > 0) {
          await this.sendAdvanceReminder(reminder, user, currentDate, currentTime, advanceMinutes);
        }
      }

    } catch (error) {
      console.error(`개별 알림 발송 중 오류 (${user.email}):`, error);
    }
  }

  /**
   * 정시 알림 발송
   */
  private async sendExactTimeReminder(reminder: Reminder, user: User, currentDate: string, currentTime: string): Promise<void> {
    const notificationKey = `exact_${reminder.id}_${currentDate}_${currentTime}`;
    
    if (this.sentNotifications.has(notificationKey)) {
      return;
    }

    console.log(`📧 ${reminder.title}: 정시 알림 발송 중...`);
    
    const success = await this.emailService.sendReminderNotification(reminder, user);
    
    if (success) {
      this.sentNotifications.add(notificationKey);
      console.log(`✅ ${reminder.title}: 정시 알림 발송 완료`);
    } else {
      console.error(`❌ ${reminder.title}: 정시 알림 발송 실패`);
    }
  }

  /**
   * 사전 알림 발송
   */
  private async sendAdvanceReminder(reminder: Reminder, user: User, currentDate: string, currentTime: string, advanceMinutes: number): Promise<void> {
    if (!reminder.time || !advanceMinutes) return;

    // 알림 시간 계산
    const reminderTime = new Date(`${currentDate}T${reminder.time}:00`);
    const advanceTime = new Date(reminderTime.getTime() - advanceMinutes * 60 * 1000);
    const advanceTimeString = this.formatTime(advanceTime);

    // 현재 시간이 사전 알림 시간과 일치하는지 확인
    if (advanceTimeString !== currentTime) return;

    const notificationKey = `advance_${reminder.id}_${currentDate}_${currentTime}`;
    
    if (this.sentNotifications.has(notificationKey)) {
      return;
    }

    console.log(`📧 ${reminder.title}: 사전 알림 발송 중... (${advanceMinutes}분 전)`);
    
    // 사전 알림용 이메일 발송
    const success = await this.emailService.sendAdvanceReminderNotification(reminder, user, advanceMinutes);
    
    if (success) {
      this.sentNotifications.add(notificationKey);
      console.log(`✅ ${reminder.title}: 사전 알림 발송 완료`);
    } else {
      console.error(`❌ ${reminder.title}: 사전 알림 발송 실패`);
    }
  }


  /**
   * 날짜를 YYYY-MM-DD 형식으로 포맷
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 시간을 HH:MM 형식으로 포맷
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * 발송된 알림 기록 초기화 (새로운 날이 되면 호출)
   */
  public resetSentNotifications(): void {
    this.sentNotifications.clear();
    console.log('🔄 발송된 알림 기록 초기화');
  }

  /**
   * 수동으로 알림 확인 및 발송 (테스트용)
   */
  public async manualCheck(): Promise<void> {
    console.log('🔍 수동 알림 확인 시작');
    await this.checkAndSendNotifications();
  }

  /**
   * 현재 발송된 알림 기록 조회
   */
  public getSentNotifications(): string[] {
    return Array.from(this.sentNotifications);
  }
}
