'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { useReminders } from '../hooks/useReminders';
import { Reminder } from '../types/reminder';
import { LoadingSpinner } from './LoadingSpinner';

interface ReminderListProps {
  userEmail: string;
}

export const ReminderList: React.FC<ReminderListProps> = ({ userEmail }) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const {
    reminders,
    loading,
    error,
    deleteReminder,
    toggleCompletion,
    getUpcomingReminders,
    getRemindersByDate,
  } = useReminders();

  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const filterReminders = async () => {
      // 먼저 사용자별로 필터링
      let userReminders = reminders.filter(r => r.email === userEmail);
      
      let filtered: Reminder[] = [];
      
      switch (filter) {
        case 'upcoming':
          filtered = await getUpcomingReminders(7);
          // 사용자별 필터링 적용
          filtered = filtered.filter(r => r.email === userEmail);
          break;
        case 'completed':
          filtered = userReminders.filter(r => r.isCompleted);
          break;
        case 'all':
        default:
          filtered = userReminders;
          break;
      }

      if (selectedDate) {
        filtered = filtered.filter(r => r.date === selectedDate);
      }

      setFilteredReminders(filtered);
    };

    filterReminders();
  }, [reminders, filter, selectedDate, getUpcomingReminders, userEmail]);

  const handleToggleCompletion = async (id: string) => {
    await toggleCompletion(id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      await deleteReminder(id);
    }
  };

  const formatDate = (dateString: string) => {
    // 빈 문자열이나 null 체크
    if (!dateString || dateString.trim() === '') {
      console.error('Empty date string');
      return '날짜 없음';
    }
    
    const date = new Date(dateString);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return `잘못된 날짜: ${dateString}`;
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getDateInputValue = () => {
    if (!selectedDate) return '';
    return selectedDate;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner text="일정을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            다가오는 일정
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            완료된 일정
          </Button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="date"
            value={getDateInputValue()}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearDateFilter}
            >
              날짜 필터 제거
            </Button>
          )}
        </div>
      </Card>

      {/* 일정 목록 */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-gray-500">
              {filter === 'all' && '등록된 일정이 없습니다.'}
              {filter === 'upcoming' && '다가오는 일정이 없습니다.'}
              {filter === 'completed' && '완료된 일정이 없습니다.'}
            </div>
          </Card>
        ) : (
          filteredReminders.map((reminder) => (
            <Card key={reminder.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Checkbox
                    checked={reminder.isCompleted}
                    onCheckedChange={() => handleToggleCompletion(reminder.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold ${reminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {reminder.title}
                      </h3>
                      {reminder.isCompleted && (
                        <Badge variant="secondary">완료</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>{formatDate(reminder.date)}</span>
                      </div>
                      
                      {reminder.time && (
                        <div className="flex items-center space-x-2">
                          <span>⏰</span>
                          <span>{formatTime(reminder.time)}</span>
                        </div>
                      )}
                      
                      {reminder.description && (
                        <div className="flex items-start space-x-2">
                          <span>📝</span>
                          <span>{reminder.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
