import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/notificationService';

// 알림 서비스 테스트 API
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 알림 서비스 테스트 시작');
    
    const notificationService = NotificationService.getInstance();
    
    // 현재 상태 확인
    const isRunning = notificationService.isServiceRunning();
    const sentNotifications = notificationService.getSentNotifications();
    
    // 수동으로 알림 체크 실행
    await notificationService.checkAndSendNotifications();
    
    return NextResponse.json({
      success: true,
      message: '알림 서비스 테스트 완료',
      isRunning,
      sentNotificationsCount: sentNotifications.length,
      sentNotifications: sentNotifications.slice(-5), // 최근 5개만
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('알림 서비스 테스트 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 서비스 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// POST 요청으로도 테스트 가능
export async function POST(request: NextRequest) {
  return GET(request);
}
