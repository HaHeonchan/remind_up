'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useChat } from '../hooks/useChat';
import { useReminders } from '../hooks/useReminders';
import { User } from '../types/user';
import { ChatMessage } from '../types/chat';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatBotProps {
  user: User | null;
}

export const ChatBot: React.FC<ChatBotProps> = ({ user }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, error, sendMessage } = useChat(user);
  const { createReminder } = useReminders();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleAutoCreateReminder = async (reminderData: any) => {
    if (!user) return;
    
    // 일정 데이터 디버깅 로그
    console.log('ChatBot: 일정 생성 시도:', reminderData);
    
    // 날짜 유효성 검증
    if (reminderData.date) {
      const date = new Date(reminderData.date);
      console.log('ChatBot: 날짜 검증:', reminderData.date, '->', date, '유효성:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.error('ChatBot: 유효하지 않은 날짜로 인한 일정 생성 실패:', reminderData.date);
        return;
      }
    }
    
    try {
      await createReminder({
        ...reminderData,
        email: user.email,
      });
      
      // 성공 메시지 추가
      const successMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: '✅ 일정이 자동으로 등록되었습니다!',
        timestamp: new Date().toISOString(),
      };
      
      // 메시지 목록에 성공 메시지 추가 (실제 구현은 useChat 훅에서 처리)
      console.log('일정 자동 등록 완료:', reminderData);
    } catch (error) {
      console.error('자동 일정 생성 실패:', error);
    }
  };

  const handleReminderCreate = async (reminderData: any) => {
    if (!user) return;
    
    try {
      await createReminder({
        ...reminderData,
        email: user.email,
      });
    } catch (error) {
      console.error('일정 생성 실패:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
          
          {/* 일정 정보가 완전한 경우 - 자동 등록 */}
          {message.reminderData && !message.needsMoreInfo && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <div className="text-sm font-semibold mb-1 text-green-800">✅ 일정 자동 등록됨</div>
              <div className="text-xs space-y-1 text-green-700">
                <div>제목: {message.reminderData.title}</div>
                <div>날짜: {message.reminderData.date}</div>
                {message.reminderData.time && (
                  <div>시간: {message.reminderData.time}</div>
                )}
                {message.reminderData.description && (
                  <div>설명: {message.reminderData.description}</div>
                )}
              </div>
              <div className="text-xs text-green-600 mt-1">
                일정이 자동으로 등록되었습니다. 일정 목록에서 확인하실 수 있습니다.
              </div>
            </div>
          )}

          {/* 일정 수정 요청인 경우 */}
          {message.updateData && !message.needsMoreInfo && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-semibold mb-1 text-blue-800">🔄 일정 수정됨</div>
              <div className="text-xs space-y-1 text-blue-700">
                <div>수정된 일정 ID: {message.updateData.targetReminderId}</div>
                {message.updateData.updatedFields.title && (
                  <div>새 제목: {message.updateData.updatedFields.title}</div>
                )}
                {message.updateData.updatedFields.date && (
                  <div>새 날짜: {message.updateData.updatedFields.date}</div>
                )}
                {message.updateData.updatedFields.time && (
                  <div>새 시간: {message.updateData.updatedFields.time}</div>
                )}
                {message.updateData.updatedFields.description && (
                  <div>새 설명: {message.updateData.updatedFields.description}</div>
                )}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                일정이 수정되었습니다. 일정 목록에서 확인하실 수 있습니다.
              </div>
            </div>
          )}

          {/* 추가 정보가 필요한 경우 */}
          {message.needsMoreInfo && message.missingFields && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm font-semibold mb-1 text-yellow-800">💡 추가 정보 필요</div>
              <div className="text-xs text-yellow-700">
                다음 정보를 추가로 알려주세요: {message.missingFields.join(', ')}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-500">
          로그인이 필요합니다. 사용자 정보를 먼저 입력해주세요.
        </div>
      </Card>
    );
  }


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🤖</div>
            <div>안녕하세요! 저는 일정 관리 AI 어시스턴트입니다.</div>
            <div className="text-sm mt-2">
              일정 등록: "내일 오후 3시에 회의가 있어"<br/>
              일반 대화: "안녕하세요", "오늘 날씨 어때요?" 등
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id || index}>
              {renderMessage(message)}
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" text="AI가 응답 중..." />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-4 mb-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}


      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="일정 등록이나 일반 대화를 해보세요..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !inputValue.trim()}>
            전송
          </Button>
        </div>
      </form>
    </div>
  );
};
