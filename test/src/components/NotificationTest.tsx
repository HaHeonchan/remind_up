'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useReminders } from '@/hooks/useReminders';
import { useUser } from '@/hooks/useUser';
import { Clock, Plus, TestTube } from 'lucide-react';

export const NotificationTest: React.FC = () => {
  const { createReminder } = useReminders();
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [testTime, setTestTime] = useState('');

  // 현재 시간에서 1분 후로 설정
  React.useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const timeString = now.toTimeString().slice(0, 5); // HH:MM 형식
    setTestTime(timeString);
  }, []);

  const createTestReminder = async () => {
    if (!user || !testTime) return;

    setIsCreating(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      
      await createReminder({
        title: '테스트 알림',
        date: today,
        time: testTime,
        description: '알림 시스템 테스트용 일정입니다.',
        email: user.email,
      });

      alert(`테스트 일정이 생성되었습니다!\n시간: ${testTime}\n1분 후에 알림이 발송됩니다.`);
    } catch (error) {
      console.error('테스트 일정 생성 실패:', error);
      alert('테스트 일정 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const createImmediateTestReminder = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      await createReminder({
        title: '즉시 테스트 알림',
        date: today,
        time: currentTime,
        description: '즉시 발송되는 테스트 알림입니다.',
        email: user.email,
      });

      alert(`즉시 테스트 일정이 생성되었습니다!\n시간: ${currentTime}\n수동 확인 버튼을 눌러 알림을 발송하세요.`);
    } catch (error) {
      console.error('즉시 테스트 일정 생성 실패:', error);
      alert('즉시 테스트 일정 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          테스트를 위해 먼저 사용자 정보를 등록해주세요.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <TestTube className="w-5 h-5" />
        <h3 className="text-lg font-semibold">알림 테스트</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="testTime">테스트 시간</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="testTime"
              type="time"
              value={testTime}
              onChange={(e) => setTestTime(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={createTestReminder}
              disabled={isCreating || !testTime}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              {isCreating ? '생성 중...' : '테스트 일정 생성'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            설정된 시간에 알림이 발송됩니다.
          </p>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">즉시 테스트</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            현재 시간으로 테스트 일정을 생성하고 수동으로 알림을 발송할 수 있습니다.
          </p>
          <Button
            onClick={createImmediateTestReminder}
            disabled={isCreating}
            variant="outline"
            size="sm"
          >
            <TestTube className="w-4 h-4 mr-1" />
            {isCreating ? '생성 중...' : '즉시 테스트 일정 생성'}
          </Button>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">테스트 방법</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <div>1. 테스트 시간을 설정하고 "테스트 일정 생성" 클릭</div>
            <div>2. 설정된 시간이 되면 자동으로 알림 발송</div>
            <div>3. 또는 "즉시 테스트 일정 생성" 후 "수동 확인" 버튼 사용</div>
            <div>4. 프로필 페이지의 "알림 서비스" 탭에서 상태 확인</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
