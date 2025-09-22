'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useReminders } from '../hooks/useReminders';
import { Reminder, CreateReminderData, UpdateReminderData } from '../types/reminder';

interface ReminderFormProps {
  userEmail: string;
  reminder?: Reminder;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
  userEmail,
  reminder,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateReminderData>({
    title: '',
    date: '',
    time: '',
    description: '',
    email: userEmail,
  });
  
  const [errors, setErrors] = useState<Partial<CreateReminderData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createReminder, updateReminder } = useReminders();

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        date: reminder.date,
        time: reminder.time || '',
        description: reminder.description || '',
        email: reminder.email,
      });
    } else {
      // 새 일정의 경우 기본값 설정
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        date: today,
        time: '',
        description: '',
        email: userEmail,
      });
    }
  }, [reminder, userEmail]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateReminderData> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = '오늘 이후의 날짜를 선택해주세요.';
      }
    }

    if (formData.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = '올바른 시간 형식으로 입력해주세요. (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (reminder) {
        // 수정
        const updateData: UpdateReminderData = {
          title: formData.title,
          date: formData.date,
          time: formData.time || undefined,
          description: formData.description || undefined,
        };
        await updateReminder(reminder.id, updateData);
      } else {
        // 생성
        await createReminder(formData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('일정 저장 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateReminderData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="일정 제목을 입력하세요"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={getMinDate()}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <Label htmlFor="time">시간</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className={errors.time ? 'border-red-500' : ''}
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="일정에 대한 추가 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : reminder ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
