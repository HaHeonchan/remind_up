import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/notificationService';

// 서버 사이드에서 실행되는 알림 체크 API
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 서버 사이드 알림 체크 시작');
    
    const notificationService = NotificationService.getInstance();
    
    // 수동으로 알림 체크 실행
    await notificationService.checkAndSendNotifications();
    
    return NextResponse.json({
      success: true,
      message: '서버 사이드 알림 체크 완료',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('서버 사이드 알림 체크 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 사이드 알림 체크 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// POST 요청으로도 알림 체크 가능
export async function POST(request: NextRequest) {
  return GET(request);
}
