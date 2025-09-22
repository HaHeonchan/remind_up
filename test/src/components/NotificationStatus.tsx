'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, Play, Pause, RefreshCw, RotateCcw } from 'lucide-react';
import { NotificationTest } from './NotificationTest';

interface NotificationStatusProps {
  className?: string;
}

export const NotificationStatus: React.FC<NotificationStatusProps> = ({ className }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.success) {
        setIsRunning(result.isRunning);
        setSentNotifications(result.sentNotifications || []);
      }
    } catch (error) {
      console.error('알림 서비스 상태 확인 실패:', error);
    }
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      if (action === 'check') {
        // 수동 알림 확인 - 클라이언트에서 직접 실행
        await manualCheckNotifications();
      } else if (action === 'reset') {
        // 발송 기록 초기화 - 클라이언트에서 직접 실행
        localStorage.removeItem('sentNotifications');
        setSentNotifications([]);
        console.log('발송된 알림 기록이 초기화되었습니다.');
      } else {
        // start/stop은 API 호출
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        });

        const result = await response.json();
        
        if (result.success) {
          await fetchStatus(); // 상태 새로고침
        } else {
          console.error('액션 실행 실패:', result.error);
        }
      }
    } catch (error) {
      console.error('액션 실행 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const manualCheckNotifications = async () => {
    try {
      const now = new Date();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);

      console.log(`🔍 수동 알림 확인 중... (${currentDate} ${currentTime})`);

      // localStorage에서 사용자 정보 가져오기
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      for (const user of users) {
        if (!user.preferences.emailNotifications) {
          continue;
        }

        // 일일 알림 확인
        if (user.preferences.reminderTime === currentTime) {
          await sendDailyReminders(user, currentDate);
        }

        // 개별 알림 확인
        await sendSpecificTimeReminders(user, currentDate, currentTime);
      }

      console.log('✅ 수동 알림 확인 완료');
    } catch (error) {
      console.error('수동 알림 확인 중 오류:', error);
    }
  };

  const sendDailyReminders = async (user: any, currentDate: string) => {
    try {
      const remindersJson = localStorage.getItem('reminders');
      const allReminders = remindersJson ? JSON.parse(remindersJson) : [];
      const todayReminders = allReminders.filter((r: any) => 
        r.date === currentDate && r.email === user.email && !r.isCompleted
      );

      if (todayReminders.length === 0) {
        console.log(`📅 ${user.email}: 오늘 일정이 없습니다.`);
        return;
      }

      console.log(`📧 ${user.email}: 일일 알림 발송 중... (${todayReminders.length}개 일정)`);
      
      const success = await sendEmailNotification(user.email, '일정 요약', todayReminders);
      
      if (success) {
        console.log(`✅ ${user.email}: 일일 알림 발송 완료`);
      } else {
        console.error(`❌ ${user.email}: 일일 알림 발송 실패`);
      }
    } catch (error) {
      console.error(`일일 알림 발송 중 오류 (${user.email}):`, error);
    }
  };

  const sendSpecificTimeReminders = async (user: any, currentDate: string, currentTime: string) => {
    try {
      const remindersJson = localStorage.getItem('reminders');
      const allReminders = remindersJson ? JSON.parse(remindersJson) : [];
      const timeSpecificReminders = allReminders.filter((r: any) => 
        r.date === currentDate && 
        r.time === currentTime && 
        r.email === user.email && 
        !r.isCompleted
      );

      for (const reminder of timeSpecificReminders) {
        console.log(`📧 ${reminder.title}: 개별 알림 발송 중...`);
        
        const success = await sendEmailNotification(user.email, `일정 알림: ${reminder.title}`, [reminder]);
        
        if (success) {
          console.log(`✅ ${reminder.title}: 개별 알림 발송 완료`);
        } else {
          console.error(`❌ ${reminder.title}: 개별 알림 발송 실패`);
        }
      }
    } catch (error) {
      console.error(`개별 알림 발송 중 오류 (${user.email}):`, error);
    }
  };

  const sendEmailNotification = async (to: string, subject: string, reminders: any[]) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: generateEmailHTML(reminders),
          text: generateEmailText(reminders),
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      return false;
    }
  };

  const generateEmailHTML = (reminders: any[]) => {
    if (reminders.length === 1) {
      const reminder = reminders[0];
      return `
        <h2>일정 알림: ${reminder.title}</h2>
        <p><strong>날짜:</strong> ${formatDateDisplay(reminder.date)}</p>
        ${reminder.time ? `<p><strong>시간:</strong> ${reminder.time}</p>` : ''}
        ${reminder.description ? `<p><strong>설명:</strong> ${reminder.description}</p>` : ''}
      `;
    } else {
      return `
        <h2>일정 요약 (${reminders.length}개)</h2>
        ${reminders.map((reminder, index) => `
          <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
            <h3>${index + 1}. ${reminder.title}</h3>
            <p><strong>날짜:</strong> ${formatDateDisplay(reminder.date)}</p>
            ${reminder.time ? `<p><strong>시간:</strong> ${reminder.time}</p>` : ''}
            ${reminder.description ? `<p><strong>설명:</strong> ${reminder.description}</p>` : ''}
          </div>
        `).join('')}
      `;
    }
  };

  const generateEmailText = (reminders: any[]) => {
    if (reminders.length === 1) {
      const reminder = reminders[0];
      let text = `일정 알림: ${reminder.title}\n`;
      text += `날짜: ${formatDateDisplay(reminder.date)}\n`;
      if (reminder.time) text += `시간: ${reminder.time}\n`;
      if (reminder.description) text += `설명: ${reminder.description}\n`;
      return text;
    } else {
      let text = `일정 요약 (${reminders.length}개)\n\n`;
      reminders.forEach((reminder, index) => {
        text += `${index + 1}. ${reminder.title}\n`;
        text += `   날짜: ${formatDateDisplay(reminder.date)}\n`;
        if (reminder.time) text += `   시간: ${reminder.time}\n`;
        if (reminder.description) text += `   설명: ${reminder.description}\n`;
        text += '\n';
      });
      return text;
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateDisplay = (dateString: string) => {
    // 빈 문자열이나 null 체크
    if (!dateString || dateString.trim() === '') {
      console.error('Empty date string in NotificationStatus');
      return '날짜 없음';
    }
    
    const date = new Date(dateString);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      console.error('Invalid date string in NotificationStatus:', dateString);
      return `잘못된 날짜: ${dateString}`;
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  useEffect(() => {
    fetchStatus();
    
    // 30초마다 상태 새로고침
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <h3 className="text-lg font-semibold">알림 서비스</h3>
          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {isRunning ? '실행 중' : '중지됨'}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(isRunning ? 'stop' : 'start')}
            disabled={isLoading}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                중지
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                시작
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('check')}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            수동 확인
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('reset')}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            기록 초기화
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <div>
          <strong>상태:</strong> {isRunning ? '매 분마다 알림을 확인하고 있습니다' : '알림 서비스가 중지되었습니다'}
        </div>
        <div>
          <strong>발송된 알림:</strong> {sentNotifications.length}개
        </div>
        {sentNotifications.length > 0 && (
          <div className="mt-2">
            <strong>최근 발송 기록:</strong>
            <div className="mt-1 max-h-20 overflow-y-auto">
              {sentNotifications.slice(-5).map((notification, index) => (
                <div key={index} className="text-xs text-gray-500">
                  • {notification}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">알림 동작 방식</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• <strong>일일 알림:</strong> 사용자 설정 시간에 오늘의 모든 일정 요약 발송</div>
          <div>• <strong>개별 알림:</strong> 일정에 설정된 특정 시간에 개별 알림 발송</div>
          <div>• <strong>중복 방지:</strong> 같은 알림은 하루에 한 번만 발송</div>
        </div>
      </div>

      {/* 알림 테스트 */}
      <div className="mt-4">
        <NotificationTest />
      </div>
    </Card>
  );
};
