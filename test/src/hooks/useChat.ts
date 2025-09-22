import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, ChatSession } from '../types/chat';
import { AIService } from '../services/aiService';
import { JsonStorageService } from '../storage/jsonStorage';
import { User } from '../types/user';
import { useReminders } from './useReminders';

export const useChat = (user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const aiService = useMemo(() => AIService.getInstance(), []);
  const storage = useMemo(() => new JsonStorageService(), []);
  const { createReminder, updateReminder, reminders } = useReminders();

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const session = storage.getChatSession(sessionId);
      if (session) {
        setMessages(session.messages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storage]);

  const createNewSession = useCallback((): string => {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    storage.saveChatSession(newSession);
    setCurrentSessionId(sessionId);
    setMessages([]);
    return sessionId;
  }, [storage]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      // AI 응답 생성 (기존 일정 목록 포함)
      const userReminders = reminders.filter(reminder => reminder.email === user.email);
      const aiResponse = await aiService.generateChatResponse(content, user.email, userReminders);

      // AI 응답을 ChatMessage 형태로 매핑
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
        messageType: aiResponse.messageType,
        reminderData: aiResponse.reminderData || undefined,
        needsMoreInfo: aiResponse.needsMoreInfo,
        missingFields: aiResponse.missingFields,
        updateData: aiResponse.updateData,
      };
      
      // 일정 수정 요청인 경우
      if (aiResponse.updateData && !aiResponse.needsMoreInfo) {
        try {
          await updateReminder(aiResponse.updateData.targetReminderId, aiResponse.updateData.updatedFields);
          
          // 수정 성공 메시지 추가
          const updateSuccessMessage: ChatMessage = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            role: 'assistant',
            content: '✅ 일정이 수정되었습니다!',
            timestamp: new Date().toISOString(),
          };
          
          const finalMessages = [...newMessages, assistantMessage, updateSuccessMessage];
          setMessages(finalMessages);
          
          // 세션 업데이트
          if (currentSessionId) {
            const session = storage.getChatSession(currentSessionId);
            if (session) {
              const updatedSession: ChatSession = {
                ...session,
                messages: finalMessages,
                updatedAt: new Date().toISOString(),
              };
              storage.saveChatSession(updatedSession);
            }
          }
          return;
        } catch (updateError) {
          console.error('일정 수정 실패:', updateError);
          // 수정 실패해도 AI 응답은 표시
        }
      }
      
      // 일정 정보가 완전한 경우에만 자동으로 일정 등록 (일반 대화 제외)
      if (aiResponse.reminderData && !aiResponse.needsMoreInfo && aiResponse.messageType === 'reminder') {
        // 날짜 유효성 검증
        const date = new Date(aiResponse.reminderData.date);
        if (isNaN(date.getTime())) {
          console.error('useChat: 유효하지 않은 날짜:', aiResponse.reminderData.date);
          // 유효하지 않은 날짜인 경우 일반 대화로 처리
          const invalidDateAssistantMessage: ChatMessage = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            role: 'assistant',
            content: '죄송합니다. 날짜 형식에 오류가 있습니다. 다시 시도해주세요.',
            timestamp: new Date().toISOString(),
            messageType: 'general',
          };
          const finalMessages = [...newMessages, invalidDateAssistantMessage];
          setMessages(finalMessages);
          return;
        }
        
        try {
          await createReminder({
            ...aiResponse.reminderData,
            email: user.email,
          });
          
          // 자동 등록 성공 메시지 추가
          const autoCreateMessage: ChatMessage = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            role: 'assistant',
            content: '✅ 일정이 자동으로 등록되었습니다!',
            timestamp: new Date().toISOString(),
          };
          
          const finalMessages = [...newMessages, assistantMessage, autoCreateMessage];
          setMessages(finalMessages);
          
          // 세션 업데이트
          if (currentSessionId) {
            const session = storage.getChatSession(currentSessionId);
            if (session) {
              const updatedSession: ChatSession = {
                ...session,
                messages: finalMessages,
                updatedAt: new Date().toISOString(),
              };
              storage.saveChatSession(updatedSession);
            }
          }
          return;
        } catch (reminderError) {
          console.error('자동 일정 등록 실패:', reminderError);
          // 자동 등록 실패해도 AI 응답은 표시
        }
      }
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // 세션 업데이트
      if (currentSessionId) {
        const session = storage.getChatSession(currentSessionId);
        if (session) {
          const updatedSession: ChatSession = {
            ...session,
            messages: finalMessages,
            updatedAt: new Date().toISOString(),
          };
          storage.saveChatSession(updatedSession);
        }
      }
    } catch (err) {
      console.error('메시지 전송 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '메시지 전송에 실패했습니다.';
      setError(errorMessage);
      
      // 오류 메시지도 채팅에 추가
      const errorChatMessage: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        role: 'assistant',
        content: `죄송합니다. 오류가 발생했습니다: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
      
      const errorMessages = [...messages, errorChatMessage];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  }, [user, messages, currentSessionId, aiService, storage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (currentSessionId) {
      const session = storage.getChatSession(currentSessionId);
      if (session) {
        const updatedSession: ChatSession = {
          ...session,
          messages: [],
          updatedAt: new Date().toISOString(),
        };
        storage.saveChatSession(updatedSession);
      }
    }
  }, [currentSessionId, storage]);

  const getSessions = useCallback((): ChatSession[] => {
    return storage.getChatSessions();
  }, [storage]);

  const deleteSession = useCallback((sessionId: string): void => {
    storage.deleteChatSession(sessionId);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [currentSessionId, storage]);

  useEffect(() => {
    if (!currentSessionId) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession]);

  return {
    messages,
    loading,
    error,
    currentSessionId,
    sendMessage,
    clearMessages,
    loadMessages,
    createNewSession,
    getSessions,
    deleteSession,
  };
};
