import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/notificationService';

// Render에서 외부 cron 서비스가 호출할 수 있는 엔드포인트
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 [CRON] 외부 cron 서비스에서 알림 체크 요청');
    
    const notificationService = NotificationService.getInstance();
    await notificationService.checkAndSendNotifications();
    
    return NextResponse.json({ 
      success: true, 
      message: '알림 체크 완료',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🕐 [CRON] 알림 체크 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 체크 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// POST 요청으로도 호출 가능
export async function POST(request: NextRequest) {
  return GET(request);
}
