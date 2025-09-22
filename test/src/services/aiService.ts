import { CreateReminderData } from '../types/reminder';

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async parseReminderFromText(text: string, userEmail: string): Promise<{
    messageType: 'reminder' | 'general' | 'update';
    reminderData: CreateReminderData | null;
    response: string;
    needsMoreInfo?: boolean;
    missingFields?: string[];
    updateData?: any;
  }> {
    try {
      // API 라우트를 통해 OpenAI 호출
      const response = await fetch('/api/ai/parse-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 호출 실패');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('AI 서비스 오류:', error);
      // AI API 실패 시 기본 응답 반환
      return {
        messageType: 'general',
        reminderData: null,
        response: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.'
      };
    }
  }

  public async generateChatResponse(text: string, userEmail: string, existingReminders?: any[]): Promise<{
    messageType: 'reminder' | 'general' | 'update';
    reminderData: CreateReminderData | null;
    response: string;
    needsMoreInfo?: boolean;
    missingFields?: string[];
    updateData?: any;
  }> {
    // 수정 의도 감지
    const isUpdateRequest = this.detectUpdateIntent(text);
    
    if (isUpdateRequest) {
      return await this.handleUpdateRequest(text, userEmail, existingReminders);
    }

    return await this.parseReminderFromText(text, userEmail);
  }

  private detectUpdateIntent(text: string): boolean {
    const updateKeywords = [
      '바꿔', '변경', '수정', '고쳐', '다시', '다른', '대신', '교체', '업데이트'
    ];
    
    return updateKeywords.some(keyword => text.includes(keyword));
  }

  private async handleUpdateRequest(text: string, userEmail: string, existingReminders?: any[]): Promise<{
    messageType: 'reminder' | 'general' | 'update';
    reminderData: CreateReminderData | null;
    response: string;
    needsMoreInfo?: boolean;
    missingFields?: string[];
    updateData?: any;
  }> {
    try {
      const response = await fetch('/api/ai/parse-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          userEmail, 
          existingReminders,
          isUpdateRequest: true 
        }),
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('수정 요청 처리 오류:', error);
      return {
        messageType: 'general',
        reminderData: null,
        response: '죄송합니다. 수정 요청을 처리할 수 없습니다.'
      };
    }
  }
}