import { Reminder } from '../types/reminder';
import { User } from '../types/user';

export class EmailService {
  private static instance: EmailService;
  
  private constructor() {}
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmailAPI(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('이메일 API 호출 실패:', error);
      return false;
    }
  }

  public async sendReminderNotification(reminder: Reminder, user: User): Promise<boolean> {
    try {
      const subject = `일정 알림: ${reminder.title}`;
      const htmlBody = this.generateEmailBody(reminder);
      const textBody = this.generateTextEmailBody(reminder);

      const success = await this.sendEmailAPI(user.email, subject, htmlBody, textBody);
      
      if (success) {
        console.log('📧 이메일 알림 발송 성공');
      } else {
        console.error('📧 이메일 알림 발송 실패');
      }
      
      return success;
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      return false;
    }
  }

  public async sendAdvanceReminderNotification(reminder: Reminder, user: User, advanceMinutes: number): Promise<boolean> {
    try {
      const subject = `일정 사전 알림: ${reminder.title} (${advanceMinutes}분 전)`;
      const htmlBody = this.generateAdvanceEmailBody(reminder, advanceMinutes);
      const textBody = this.generateAdvanceTextEmailBody(reminder, advanceMinutes);

      const success = await this.sendEmailAPI(user.email, subject, htmlBody, textBody);
      
      if (success) {
        console.log('📧 사전 알림 이메일 발송 성공');
      } else {
        console.error('📧 사전 알림 이메일 발송 실패');
      }
      
      return success;
    } catch (error) {
      console.error('사전 알림 이메일 발송 실패:', error);
      return false;
    }
  }

  public async sendReminderSummary(reminders: Reminder[], user: User): Promise<boolean> {
    try {
      const subject = `일정 요약 (${reminders.length}개)`;
      const htmlBody = this.generateSummaryEmailBody(reminders);
      const textBody = this.generateSummaryTextEmailBody(reminders);

      const success = await this.sendEmailAPI(user.email, subject, htmlBody, textBody);
      
      if (success) {
        console.log('📧 일정 요약 이메일 발송 성공');
      } else {
        console.error('📧 일정 요약 이메일 발송 실패');
      }
      
      return success;
    } catch (error) {
      console.error('요약 이메일 발송 실패:', error);
      return false;
    }
  }

  private generateEmailBody(reminder: Reminder): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .reminder-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
          .reminder-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
          .reminder-detail { margin: 10px 0; font-size: 16px; }
          .icon { margin-right: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 일정 알림</h1>
          </div>
          <div class="content">
            <div class="reminder-card">
              <div class="reminder-title">${reminder.title}</div>
              <div class="reminder-detail">
                <span class="icon">📆</span>
                <strong>날짜:</strong> ${this.formatDate(reminder.date)}
              </div>
              ${reminder.time ? `
                <div class="reminder-detail">
                  <span class="icon">⏰</span>
                  <strong>시간:</strong> ${reminder.time}
                </div>
              ` : ''}
              ${reminder.description ? `
                <div class="reminder-detail">
                  <span class="icon">📝</span>
                  <strong>설명:</strong> ${reminder.description}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>메시지 리마인더에서 발송된 알림입니다.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTextEmailBody(reminder: Reminder): string {
    let body = `안녕하세요!\n\n`;
    body += `일정 알림을 보내드립니다.\n\n`;
    body += `📅 제목: ${reminder.title}\n`;
    body += `📆 날짜: ${this.formatDate(reminder.date)}\n`;
    
    if (reminder.time) {
      body += `⏰ 시간: ${reminder.time}\n`;
    }
    
    if (reminder.description) {
      body += `📝 설명: ${reminder.description}\n`;
    }
    
    body += `\n감사합니다.`;
    
    return body;
  }

  private generateSummaryEmailBody(reminders: Reminder[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .reminder-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 10px 0; }
          .reminder-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
          .reminder-detail { margin: 5px 0; font-size: 14px; color: #6b7280; }
          .icon { margin-right: 6px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 일정 요약</h1>
            <p>총 ${reminders.length}개의 일정이 있습니다</p>
          </div>
          <div class="content">
            ${reminders.map((reminder, index) => `
              <div class="reminder-item">
                <div class="reminder-title">${index + 1}. ${reminder.title}</div>
                <div class="reminder-detail">
                  <span class="icon">📆</span>
                  ${this.formatDate(reminder.date)}
                  ${reminder.time ? `<span class="icon">⏰</span>${reminder.time}` : ''}
                </div>
                ${reminder.description ? `
                  <div class="reminder-detail">
                    <span class="icon">📝</span>
                    ${reminder.description}
                  </div>
                ` : ''}
              </div>
            `).join('')}
            <div class="footer">
              <p>메시지 리마인더에서 발송된 요약입니다.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSummaryTextEmailBody(reminders: Reminder[]): string {
    let body = `안녕하세요!\n\n`;
    body += `일정 요약을 보내드립니다.\n\n`;
    
    reminders.forEach((reminder, index) => {
      body += `${index + 1}. ${reminder.title}\n`;
      body += `   📆 ${this.formatDate(reminder.date)}`;
      if (reminder.time) {
        body += ` ⏰ ${reminder.time}`;
      }
      body += `\n`;
      if (reminder.description) {
        body += `   📝 ${reminder.description}\n`;
      }
      body += `\n`;
    });
    
    body += `감사합니다.`;
    
    return body;
  }

  private generateAdvanceEmailBody(reminder: Reminder, advanceMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>일정 사전 알림</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .reminder-card { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .reminder-title { font-size: 20px; font-weight: bold; color: #856404; margin-bottom: 10px; }
          .reminder-detail { margin: 8px 0; color: #856404; }
          .icon { margin-right: 8px; }
          .advance-notice { background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0; color: #0c5460; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ 일정 사전 알림</h1>
          </div>
          <div class="content">
            <div class="advance-notice">
              <strong>${advanceMinutes}분 후에 일정이 시작됩니다!</strong>
            </div>
            <div class="reminder-card">
              <div class="reminder-title">${reminder.title}</div>
              <div class="reminder-detail">
                <span class="icon">📆</span>
                ${this.formatDate(reminder.date)}
                ${reminder.time ? `<span class="icon">⏰</span>${reminder.time}` : ''}
              </div>
              ${reminder.description ? `
                <div class="reminder-detail">
                  <span class="icon">📝</span>
                  ${reminder.description}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>메시지 리마인더에서 발송된 사전 알림입니다.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdvanceTextEmailBody(reminder: Reminder, advanceMinutes: number): string {
    let body = `안녕하세요!\n\n`;
    body += `⏰ ${advanceMinutes}분 후에 일정이 시작됩니다!\n\n`;
    body += `일정: ${reminder.title}\n`;
    body += `📆 ${this.formatDate(reminder.date)}`;
    if (reminder.time) {
      body += ` ⏰ ${reminder.time}`;
    }
    body += `\n`;
    if (reminder.description) {
      body += `📝 ${reminder.description}\n`;
    }
    body += `\n감사합니다.`;
    
    return body;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  // 이메일 전송기 연결 테스트
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'GET',
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 이메일 전송기 연결 성공');
        return true;
      } else {
        console.error('❌ 이메일 전송기 연결 실패:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ 이메일 전송기 연결 실패:', error);
      return false;
    }
  }
}
