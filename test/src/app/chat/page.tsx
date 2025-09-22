'use client';

import { ChatBot } from '../../components/ChatBot';
import { useUser } from '../../hooks/useUser';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function ChatPage() {
  const { user, loading } = useUser();

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
              AI 챗봇을 사용하려면 먼저 사용자 정보를 입력해주세요.
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">AI 챗봇</h1>
            <p className="text-gray-600">자연어로 일정을 입력해보세요</p>
          </div>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div>
                  <div className="font-semibold">AI 어시스턴트</div>
                  <div className="text-sm text-gray-500">일정을 도와드릴게요</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ChatBot user={user} />
            </div>
          </Card>

          {/* Tips */}
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 사용 팁</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• "내일 오후 3시에 회의가 있어"</div>
              <div>• "12월 25일 크리스마스 파티"</div>
              <div>• "다음주 월요일 오전 10시 미팅"</div>
              <div>• "오늘 저녁 7시에 저녁 약속"</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
