'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Calendar, User, Bot } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="사용자 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            메시지 리마인더
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI 챗봇과 함께 일정을 관리하고 이메일 알림을 받아보세요.
            자연어로 일정을 입력하면 자동으로 정리해드립니다.
          </p>
          
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                먼저 사용자 정보를 입력해주세요.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI 챗봇</h3>
            <p className="text-gray-600 mb-4">
              자연어로 일정을 입력하면 AI가 자동으로 날짜, 시간, 제목을 파싱합니다.
            </p>
            <Link href="/chat">
              <Button className="w-full">챗봇 시작하기</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">일정 관리</h3>
            <p className="text-gray-600 mb-4">
              등록된 일정을 확인하고 수정할 수 있습니다. 완료 상태도 관리하세요.
            </p>
            <Link href="/reminders">
              <Button className="w-full">일정 보기</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">사용자 설정</h3>
            <p className="text-gray-600 mb-4">
              이메일 주소와 알림 설정을 관리하여 일정 알림을 받아보세요.
            </p>
            <Link href="/profile">
              <Button className="w-full">설정하기</Button>
            </Link>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">사용 방법</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">사용자 정보 입력</h3>
              <p className="text-gray-600 text-sm">
                프로필 페이지에서 이메일 주소를 입력하세요.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">AI와 대화</h3>
              <p className="text-gray-600 text-sm">
                "내일 오후 3시에 회의가 있어"라고 말하면 AI가 자동으로 파싱합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">일정 확인</h3>
              <p className="text-gray-600 text-sm">
                일정 목록에서 등록된 일정을 확인하고 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
