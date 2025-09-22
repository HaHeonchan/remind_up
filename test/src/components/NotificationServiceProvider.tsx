'use client';

import { useEffect } from 'react';

export const NotificationServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;

    let intervalId: NodeJS.Timeout | null = null;

    const initializeNotificationService = async () => {
      try {
        // 클라이언트에서 직접 알림 서비스 시작
        console.log('🔔 클라이언트 사이드 알림 서비스 시작');
        
        // 즉시 한 번 실행
        await checkAndSendNotifications();
        
        // 매 분마다 실행
        intervalId = setInterval(async () => {
          await checkAndSendNotifications();
        }, 60 * 1000); // 1분 = 60초 * 1000ms
        
        console.log('🔔 알림 서비스가 자동으로 시작되었습니다.');
      } catch (error) {
        console.error('알림 서비스 초기화 실패:', error);
      }
    };

    const checkAndSendNotifications = async () => {
      try {
        const now = new Date();
        const currentTime = formatTime(now);
        const currentDate = formatDate(now);

        console.log(`🔍 알림 확인 중... (${currentDate} ${currentTime})`);

        // localStorage에서 사용자 정보 가져오기
        const users = getUsersFromLocalStorage();
        
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
      } catch (error) {
        console.error('알림 확인 중 오류 발생:', error);
      }
    };

    const getUsersFromLocalStorage = () => {
      try {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
      } catch (error) {
        console.error('사용자 목록 가져오기 실패:', error);
        return [];
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

        const notificationKey = `daily_${user.id}_${currentDate}`;
        const sentNotifications = getSentNotifications();
        
        if (sentNotifications.includes(notificationKey)) {
          console.log(`📅 ${user.email}: 오늘 일일 알림을 이미 발송했습니다.`);
          return;
        }

        console.log(`📧 ${user.email}: 일일 알림 발송 중... (${todayReminders.length}개 일정)`);
        
        const success = await sendEmailNotification(user.email, '일정 요약', todayReminders);
        
        if (success) {
          addSentNotification(notificationKey);
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
          const notificationKey = `specific_${reminder.id}_${currentDate}_${currentTime}`;
          const sentNotifications = getSentNotifications();
          
          if (sentNotifications.includes(notificationKey)) {
            console.log(`⏰ ${reminder.title}: 이미 발송된 알림입니다.`);
            continue;
          }

          console.log(`📧 ${reminder.title}: 개별 알림 발송 중...`);
          
          const success = await sendEmailNotification(user.email, `일정 알림: ${reminder.title}`, [reminder]);
          
          if (success) {
            addSentNotification(notificationKey);
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
        console.error('Empty date string in NotificationServiceProvider');
        return '날짜 없음';
      }
      
      const date = new Date(dateString);
      
      // Invalid Date 체크
      if (isNaN(date.getTime())) {
        console.error('Invalid date string in NotificationServiceProvider:', dateString);
        return `잘못된 날짜: ${dateString}`;
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    };

    const getSentNotifications = () => {
      try {
        const notifications = localStorage.getItem('sentNotifications');
        return notifications ? JSON.parse(notifications) : [];
      } catch (error) {
        return [];
      }
    };

    const addSentNotification = (notificationKey: string) => {
      try {
        const notifications = getSentNotifications();
        notifications.push(notificationKey);
        localStorage.setItem('sentNotifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('발송 기록 저장 실패:', error);
      }
    };

    initializeNotificationService();

    // 컴포넌트 언마운트 시 알림 서비스 중지
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🔔 알림 서비스가 중지되었습니다.');
      }
    };
  }, []);

  return <>{children}</>;
};
