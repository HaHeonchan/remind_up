import { Reminder } from './reminder';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  messageType?: 'reminder' | 'general' | 'update'; // 메시지 타입
  reminderData?: Partial<Reminder>; // AI가 파싱한 일정 데이터
  needsMoreInfo?: boolean; // 추가 정보가 필요한지 여부
  missingFields?: string[]; // 부족한 필드 목록
  updateData?: { // 일정 수정 데이터
    targetReminderId: string;
    updatedFields: Partial<Reminder>;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
