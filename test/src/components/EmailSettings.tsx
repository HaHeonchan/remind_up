'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { EmailService } from '../services/emailService';
import { emailConfig } from '../config/email';
import { EmailTest } from './EmailTest';
import { CheckCircle, XCircle, AlertCircle, Mail, Settings, Server } from 'lucide-react';

interface EmailSettingsProps {
  onSuccess?: () => void;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({ onSuccess }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isConfigValid, setIsConfigValid] = useState(false);

  // 환경변수 설정 상태 확인
  React.useEffect(() => {
    const hasValidConfig = 
      emailConfig.user !== 'your-gmail-bot@gmail.com' && 
      emailConfig.password !== 'your-app-password' &&
      emailConfig.user.includes('@') &&
      emailConfig.password.length > 0;
    
    setIsConfigValid(hasValidConfig);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const emailService = EmailService.getInstance();
      const isConnected = await emailService.testConnection();
      
      if (isConnected) {
        setTestResult('✅ 이메일 연결 테스트 성공!');
      } else {
        setTestResult('❌ 이메일 연결 테스트 실패. .env.local 파일의 설정을 확인해주세요.');
      }
    } catch (error) {
      setTestResult(`❌ 연결 테스트 중 오류 발생: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">이메일 설정</h2>
      </div>


      {/* 연결 테스트 */}
      <div className="space-y-4">
        {testResult && (
          <div className={`p-3 rounded-lg text-sm flex items-center ${
            testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {testResult.includes('✅') ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {testResult}
          </div>
        )}

        <Button
          onClick={handleTestConnection}
          disabled={isTesting || !isConfigValid}
          variant="outline"
          className="w-full"
        >
          {isTesting ? '테스트 중...' : '이메일 연결 테스트'}
        </Button>
      </div>

      {/* 이메일 테스트 */}
      <div className="mt-6">
        <EmailTest />
      </div>


      {/* 알림 동작 방식 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center">
          <Server className="w-4 h-4 mr-2" />
          알림 동작 방식
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• 서버가 매 1분마다 일정을 확인합니다</div>
          <div>• 알림 시간이 되면 자동으로 이메일을 발송합니다</div>
          <div>• 브라우저를 닫아도 서버에서 계속 알림을 발송합니다</div>
          <div>• 일정 시간 15분 전에 사전 알림도 발송됩니다</div>
        </div>
      </div>
    </Card>
  );
};
