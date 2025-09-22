// 이메일 설정 파일
// 실제 사용 시에는 환경 변수로 관리하세요

export const emailConfig = {
  // Gmail 봇 계정 정보
  user: process.env.GMAIL_USER || 'your-gmail-bot@gmail.com',
  password: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
  
  // SMTP 설정
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  
  // 발신자 정보
  from: {
    name: '메시지 리마인더',
    address: process.env.GMAIL_USER || 'your-gmail-bot@gmail.com'
  }
};

// Gmail 앱 비밀번호 설정 안내
export const gmailSetupInstructions = `
Gmail 봇 계정 설정 방법:

1. Gmail 계정에서 2단계 인증 활성화
2. Google 계정 설정 > 보안 > 2단계 인증 > 앱 비밀번호 생성
3. '메일' 앱을 선택하고 비밀번호 생성
4. 생성된 16자리 앱 비밀번호를 위의 password 필드에 입력

주의: 일반 Gmail 비밀번호가 아닌 앱 비밀번호를 사용해야 합니다.
`;
