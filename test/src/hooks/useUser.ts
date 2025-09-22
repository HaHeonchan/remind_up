import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, CreateUserData, UpdateUserData } from '../types/user';
import { UserService } from '../services/userService';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState<string | null>(null);
  
  const userService = useMemo(() => new UserService(), []);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userService]);

  const createUser = useCallback(async (data: CreateUserData): Promise<User | null> => {
    try {
      setError(null);
      const newUser = await userService.createUser(data);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 생성에 실패했습니다.');
      return null;
    }
  }, [userService]);

  const updateUser = useCallback(async (data: UpdateUserData): Promise<User | null> => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(data);
      if (updatedUser) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 정보 수정에 실패했습니다.');
      return null;
    }
  }, [userService]);

  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>): Promise<User | null> => {
    try {
      setError(null);
      const updatedUser = await userService.updateUserPreferences(preferences);
      if (updatedUser) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정 변경에 실패했습니다.');
      return null;
    }
  }, [userService]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await userService.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    }
  }, [userService]);

  const isLoggedIn = useCallback(async (): Promise<boolean> => {
    try {
      return await userService.isLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 상태 확인에 실패했습니다.');
      return false;
    }
  }, [userService]);

  useEffect(() => {
    loadUser();
  }, []); // 빈 의존성 배열로 변경하여 컴포넌트 마운트 시에만 실행

  return {
    user,
    loading,
    error,
    createUser,
    updateUser,
    updatePreferences,
    logout,
    isLoggedIn,
    loadUser,
  };
};
