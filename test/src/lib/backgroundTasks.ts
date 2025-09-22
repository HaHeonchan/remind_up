import { NotificationService } from '@/services/notificationService';

class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  public start(): void {
    if (this.isRunning) {
      console.log('🔔 백그라운드 알림 서비스가 이미 실행 중입니다.');
      return;
    }

    console.log('🔔 백그라운드 알림 서비스 시작');
    this.isRunning = true;

    // 즉시 한 번 실행
    this.checkNotifications();

    // 매 분마다 실행 (60초)
    this.intervalId = setInterval(() => {
      this.checkNotifications();
    }, 60 * 1000);

    console.log('🔔 백그라운드 알림 서비스가 시작되었습니다. (매 1분마다 체크)');
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🔔 백그라운드 알림 서비스가 중지되었습니다.');
  }

  public isServiceRunning(): boolean {
    return this.isRunning;
  }

  private async checkNotifications(): Promise<void> {
    try {
      console.log('🔍 백그라운드 알림 체크 시작');
      const notificationService = NotificationService.getInstance();
      await notificationService.checkAndSendNotifications();
      console.log('✅ 백그라운드 알림 체크 완료');
    } catch (error) {
      console.error('❌ 백그라운드 알림 체크 실패:', error);
    }
  }
}

// 서버 시작 시 자동으로 백그라운드 작업 시작
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // 개발 환경에서만 백그라운드 작업 시작 (Render에서는 API 호출 방식 사용)
  const backgroundManager = BackgroundTaskManager.getInstance();
  backgroundManager.start();

  // 프로세스 종료 시 정리
  process.on('SIGINT', () => {
    console.log('🔔 프로세스 종료 중... 백그라운드 알림 서비스 중지');
    backgroundManager.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🔔 프로세스 종료 중... 백그라운드 알림 서비스 중지');
    backgroundManager.stop();
    process.exit(0);
  });
}

export { BackgroundTaskManager };
