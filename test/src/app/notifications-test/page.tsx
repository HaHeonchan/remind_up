'use client';

import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function NotificationsTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testNotificationService = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/test');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: '테스트 실패', details: error });
    } finally {
      setLoading(false);
    }
  };

  const testCronEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/cron');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Cron 테스트 실패', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">알림 서비스 테스트</h1>
      
      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">서버 사이드 알림 테스트</h2>
          <p className="text-gray-600 mb-4">
            서버가 실행 중일 때 브라우저 없이도 알림이 발송되는지 테스트합니다.
          </p>
          
          <div className="space-x-4">
            <Button 
              onClick={testNotificationService}
              disabled={loading}
            >
              {loading ? '테스트 중...' : '알림 서비스 테스트'}
            </Button>
            
            <Button 
              onClick={testCronEndpoint}
              disabled={loading}
              variant="outline"
            >
              {loading ? '테스트 중...' : 'Cron 엔드포인트 테스트'}
            </Button>
          </div>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">테스트 결과</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">테스트 방법</h3>
          <div className="space-y-2 text-sm">
            <p><strong>1. 서버 실행:</strong> npm run dev</p>
            <p><strong>2. 브라우저 닫기:</strong> 모든 브라우저 창을 닫습니다</p>
            <p><strong>3. 일정 등록:</strong> 터미널에서 curl로 일정을 등록합니다</p>
            <p><strong>4. 알림 확인:</strong> 설정된 시간에 이메일이 발송되는지 확인합니다</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">curl 테스트 명령어:</h4>
            <pre className="text-xs bg-white p-2 rounded border">
{`# 일정 등록 테스트
curl -X POST http://localhost:3000/api/ai/parse-reminder \\
  -H "Content-Type: application/json" \\
  -d '{"text": "내일 오후 3시에 회의", "userEmail": "test@example.com"}'`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
