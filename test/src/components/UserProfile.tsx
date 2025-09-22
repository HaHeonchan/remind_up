'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser } from '../hooks/useUser';
import { CreateUserData, UpdateUserData } from '../types/user';
import { LoadingSpinner } from './LoadingSpinner';

interface UserProfileProps {
  onSuccess?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    name: '',
  });
  
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { user, loading, error, createUser, updateUser } = useUser();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || '',
      });
      setIsEditing(false);
    } else {
      // 사용자가 없을 때는 편집 모드로 시작
      setIsEditing(true);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상이어야 합니다.';
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
      if (user) {
        // 수정
        const updateData: UpdateUserData = {
          email: formData.email,
          name: formData.name,
        };
        await updateUser(updateData);
        setIsEditing(false);
      } else {
        // 생성
        await createUser(formData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || '',
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner text="사용자 정보를 불러오는 중..." />
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {user ? '사용자 정보' : '사용자 정보 등록'}
        </h2>
        {user && !isEditing && (
          <Button variant="outline" onClick={handleEdit}>
            수정
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">이메일 *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="이메일을 입력하세요"
            disabled={!isEditing}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
            disabled={!isEditing}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>


        {(isEditing || !user) && (
          <div className="flex justify-end space-x-2 pt-4">
            {user && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : user ? '저장' : '등록'}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};
