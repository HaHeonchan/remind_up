'use client';

import { ReminderList } from '../../components/ReminderList';
import { ReminderForm } from '../../components/ReminderForm';
import { useUser } from '../../hooks/useUser';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function RemindersPage() {
  const { user, loading } = useUser();
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="사용자 정보를 불러오는 중..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-600 mb-6">
              일정을 관리하려면 먼저 사용자 정보를 입력해주세요.
            </p>
            <Link href="/profile">
              <Button className="w-full">사용자 정보 입력하기</Button>
            </Link>
            <Link href="/" className="block mt-4">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
              <p className="text-gray-600">등록된 일정을 확인하고 관리하세요</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>새 일정</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 일정 목록 */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">일정 목록</h2>
                </div>
                <ReminderList userEmail={user.email} />
              </Card>
            </div>

            {/* 일정 등록 폼 */}
            <div className="lg:col-span-1">
              {showForm ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">새 일정 등록</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      닫기
                    </Button>
                  </div>
                  <ReminderForm
                    userEmail={user.email}
                    onSuccess={() => {
                      setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                  />
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <div className="text-gray-500 mb-4">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <p>새 일정을 등록하려면</p>
                    <p>버튼을 클릭하세요</p>
                  </div>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 일정 등록
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* 도움말 */}
          <Card className="mt-6 p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">📝 일정 관리 팁</h3>
            <div className="text-sm text-green-800 space-y-1">
              <div>• 체크박스를 클릭하여 완료 상태를 변경할 수 있습니다</div>
              <div>• 날짜별로 필터링하여 특정 날짜의 일정을 확인하세요</div>
              <div>• AI 챗봇에서 자연어로 일정을 입력할 수도 있습니다</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
