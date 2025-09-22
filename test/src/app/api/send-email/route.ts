import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, type } = await request.json();

    // Gmail 설정 (환경 변수 또는 기본값 사용)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.GMAIL_USER || 'your-gmail-bot@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
      },
    });

    const mailOptions = {
      from: `메시지 리마인더 <${process.env.GMAIL_USER || 'your-gmail-bot@gmail.com'}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '이메일 발송 실패' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 연결 테스트
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.GMAIL_USER || 'your-gmail-bot@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
      },
    });

    await transporter.verify();
    
    return NextResponse.json({ success: true, message: '이메일 연결 성공' });
  } catch (error) {
    console.error('이메일 연결 실패:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '이메일 연결 실패' },
      { status: 500 }
    );
  }
}
