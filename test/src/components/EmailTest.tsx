'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { EmailService } from '../services/emailService';
import { useUser } from '../hooks/useUser';
import { useReminders } from '../hooks/useReminders';

export const EmailTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const { user } = useUser();
  const { createReminder } = useReminders();
  const emailService = EmailService.getInstance();

  const handleSendTestEmail = async () => {
    if (!testEmail || !user) return;
    
    setIsSending(true);
    setResult(null);
    
    try {
      // 테스트용 일정 생성
      const testReminder = await createReminder({
        title: '테스트 일정',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        description: '이메일 발송 테스트를 위한 일정입니다.',
        email: testEmail,
      });
      
      if (testReminder) {
        setResult('✅ 테스트 이메일이 발송되었습니다!');
      } else {
        setResult('❌ 일정 생성에 실패했습니다.');
      }
    } catch (error) {
      setResult(`❌ 이메일 발송 실패: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSummaryEmail = async () => {
    if (!testEmail || !user) return;
    
    setIsSending(true);
    setResult(null);
    
    try {
      // 현재 사용자의 일정들을 가져와서 요약 이메일 발송
      const reminders = await emailService.sendReminderSummary([], user);
      
      if (reminders) {
        setResult('✅ 요약 이메일이 발송되었습니다!');
      } else {
        setResult('❌ 요약 이메일 발송에 실패했습니다.');
      }
    } catch (error) {
      setResult(`❌ 요약 이메일 발송 실패: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">이메일 테스트</h3>
        <p className="text-gray-600 text-sm">설정한 이메일 계정으로 테스트 이메일을 발송해보세요.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="testEmail">테스트 이메일 주소</Label>
          <Input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSendTestEmail}
            disabled={isSending || !testEmail}
            variant="outline"
          >
            {isSending ? '발송 중...' : '테스트 이메일 발송'}
          </Button>
          
          <Button
            onClick={handleSendSummaryEmail}
            disabled={isSending || !testEmail}
            variant="outline"
          >
            {isSending ? '발송 중...' : '요약 이메일 발송'}
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {result}
          </div>
        )}
      </div>
    </Card>
  );
};

