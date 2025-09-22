'use client';

import { UserProfile } from '@/components/UserProfile';
import { EmailSettings } from '@/components/EmailSettings';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { User, Mail, Settings, Server, Database } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import React, { useState } from 'react';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'system'>('profile');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="사용자 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">사용자 설정</h1>
            <p className="text-gray-600">계정 정보와 시스템 설정을 관리하세요</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>계정 정보</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>이메일 설정</span>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'system'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>시스템 정보</span>
            </button>
          </div>

          {/* 탭 내용 */}
          {activeTab === 'profile' ? (
            <UserProfile />
          ) : activeTab === 'email' ? (
            <EmailSettings />
          ) : (
            <SystemInfo />
          )}

          {/* Current User Info */}
          {user && (
            <Card className="mt-6 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                현재 계정 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">이메일:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                {user.name && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">이름:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">데이터 저장:</span>
                  <span className="font-medium text-green-600">로컬 + 서버 동기화</span>
                </div>
              </div>
            </Card>
          )}

          {/* Information */}
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ 시스템 안내</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• 이메일 주소는 일정 알림을 받기 위해 필요합니다</div>
              <div>• 서버가 실행 중이면 브라우저를 닫아도 알림이 자동으로 발송됩니다</div>
              <div>• 데이터는 로컬과 서버 양쪽에 저장되어 안전하게 보관됩니다</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 시스템 정보 컴포넌트
function SystemInfo() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [notificationStatus, setNotificationStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  React.useEffect(() => {
    // 서버 상태 확인
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/notifications/test');
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    };

    // 알림 서비스 상태 확인
    const checkNotificationStatus = async () => {
      try {
        const response = await fetch('/api/notifications/cron');
        if (response.ok) {
          setNotificationStatus('active');
        } else {
          setNotificationStatus('inactive');
        }
      } catch {
        setNotificationStatus('inactive');
      }
    };

    checkServerStatus();
    checkNotificationStatus();
  }, []);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">시스템 정보</h2>
        <p className="text-gray-600">서버 상태와 알림 서비스 현황을 확인할 수 있습니다.</p>
      </div>

      <div className="space-y-4">
        {/* 서버 상태 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium">서버 상태</h3>
              <p className="text-sm text-gray-600">백그라운드 알림 서비스</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {serverStatus === 'checking' && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-600">확인 중</span>
              </>
            )}
            {serverStatus === 'online' && (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">온라인</span>
              </>
            )}
            {serverStatus === 'offline' && (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm text-red-600">오프라인</span>
              </>
            )}
          </div>
        </div>

        {/* 알림 서비스 상태 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium">알림 스케줄러</h3>
              <p className="text-sm text-gray-600">매 1분마다 일정 확인</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notificationStatus === 'checking' && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-600">확인 중</span>
              </>
            )}
            {notificationStatus === 'active' && (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">활성</span>
              </>
            )}
            {notificationStatus === 'inactive' && (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm text-red-600">비활성</span>
              </>
            )}
          </div>
        </div>

        {/* 데이터 저장 방식 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium">데이터 저장</h3>
              <p className="text-sm text-gray-600">하이브리드 스토리지 시스템</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-blue-600">동기화</span>
          </div>
        </div>
      </div>

      {/* 시스템 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">시스템 특징</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 서버 백그라운드에서 자동 알림 발송</li>
          <li>• 로컬 + 서버 이중 데이터 저장</li>
          <li>• 브라우저 종료 후에도 알림 정상 동작</li>
          <li>• 실시간 서버 상태 모니터링</li>
        </ul>
      </div>
    </Card>
  );
}
