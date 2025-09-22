import { useState, useEffect, useCallback, useMemo } from 'react';
import { Reminder, CreateReminderData, UpdateReminderData } from '../types/reminder';
import { ReminderService } from '../services/reminderService';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState<string | null>(null);
  
  const reminderService = useMemo(() => new ReminderService(), []);

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [reminderService]);

  const createReminder = useCallback(async (data: CreateReminderData): Promise<Reminder | null> => {
    try {
      setError(null);
      const newReminder = await reminderService.createReminder(data);
      setReminders(prev => [...prev, newReminder]);
      
      return newReminder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 생성에 실패했습니다.');
      return null;
    }
  }, [reminderService]);

  const updateReminder = useCallback(async (id: string, data: UpdateReminderData): Promise<Reminder | null> => {
    try {
      setError(null);
      const updatedReminder = await reminderService.updateReminder(id, data);
      if (updatedReminder) {
        setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      }
      return updatedReminder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 수정에 실패했습니다.');
      return null;
    }
  }, [reminderService]);

  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await reminderService.deleteReminder(id);
      if (success) {
        setReminders(prev => prev.filter(r => r.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 삭제에 실패했습니다.');
      return false;
    }
  }, [reminderService]);

  const toggleCompletion = useCallback(async (id: string): Promise<Reminder | null> => {
    try {
      setError(null);
      const updatedReminder = await reminderService.toggleReminderCompletion(id);
      if (updatedReminder) {
        setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      }
      return updatedReminder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정 상태 변경에 실패했습니다.');
      return null;
    }
  }, [reminderService]);

  const getUpcomingReminders = useCallback(async (days: number = 7): Promise<Reminder[]> => {
    try {
      setError(null);
      return await reminderService.getUpcomingReminders(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : '다가오는 일정을 불러오는데 실패했습니다.');
      return [];
    }
  }, [reminderService]);

  const getRemindersByDate = useCallback(async (date: string): Promise<Reminder[]> => {
    try {
      setError(null);
      return await reminderService.getRemindersByDate(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : '해당 날짜의 일정을 불러오는데 실패했습니다.');
      return [];
    }
  }, [reminderService]);

  useEffect(() => {
    loadReminders();
  }, []); // 빈 의존성 배열로 변경하여 컴포넌트 마운트 시에만 실행

  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleCompletion,
    getUpcomingReminders,
    getRemindersByDate,
    loadReminders,
  };
};
