import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/notificationService';

export async function GET(request: NextRequest) {
  try {
    const notificationService = NotificationService.getInstance();
    
    return NextResponse.json({
      success: true,
      isRunning: notificationService.isServiceRunning(),
      sentNotifications: notificationService.getSentNotifications(),
    });
  } catch (error) {
    console.error('알림 서비스 상태 확인 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 서비스 상태 확인 실패' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // 서버 사이드에서는 알림 서비스를 직접 제어할 수 없으므로
    // 클라이언트에서 실행되도록 안내 메시지만 반환
    switch (action) {
      case 'start':
        return NextResponse.json({
          success: true,
          message: '알림 서비스 시작 요청이 수신되었습니다. 클라이언트에서 실행됩니다.',
          isRunning: true,
        });

      case 'stop':
        return NextResponse.json({
          success: true,
          message: '알림 서비스 중지 요청이 수신되었습니다.',
          isRunning: false,
        });

      case 'check':
        return NextResponse.json({
          success: true,
          message: '수동 알림 확인 요청이 수신되었습니다. 클라이언트에서 실행됩니다.',
        });

      case 'reset':
        return NextResponse.json({
          success: true,
          message: '발송된 알림 기록 초기화 요청이 수신되었습니다.',
        });

      default:
        return NextResponse.json(
          { success: false, error: '잘못된 액션입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('알림 서비스 제어 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 서비스 제어 실패' },
      { status: 500 }
    );
  }
}
