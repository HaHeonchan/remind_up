# Remind Up - AI 일정 관리 앱

AI를 활용한 자연어 일정 관리 애플리케이션입니다.

## 주요 기능

- 🤖 **AI 자연어 파싱**: "내일 오후 3시 회의" 같은 자연어로 일정 등록
- 📧 **자동 이메일 알림**: Gmail SMTP를 통한 자동 알림 발송
- 🔄 **실시간 동기화**: 로컬 + 서버 하이브리드 스토리지
- 📱 **반응형 UI**: 모바일 친화적인 인터페이스

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-3.5-turbo
- **이메일**: Nodemailer + Gmail SMTP
- **스토리지**: localStorage + JSON 파일 스토리지
- **UI**: shadcn/ui, Lucide React

## 로컬 개발

### 1. 저장소 클론
```bash
git clone <repository-url>
cd remind_up/test
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2048

# Gmail SMTP 설정 (알림 발송용)
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password
```

### 4. Gmail 설정
1. Gmail 계정에서 2단계 인증 활성화
2. 앱 비밀번호 생성
3. 위 환경변수에 Gmail 계정과 앱 비밀번호 입력

### 5. 개발 서버 실행
```bash
npm run dev
```

## Render 배포

### 1. GitHub에 코드 푸시
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 2. Render에서 서비스 생성
1. [Render](https://render.com)에 로그인
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 다음 설정 사용:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 3. 환경변수 설정
Render 대시보드에서 다음 환경변수들을 설정하세요:
- `OPENAI_API_KEY`: OpenAI API 키
- `GMAIL_USER`: Gmail 계정
- `GMAIL_PASSWORD`: Gmail 앱 비밀번호
- `NODE_ENV`: `production`

### 4. Cron 서비스 설정 (선택사항)
알림 기능을 위해 외부 cron 서비스 사용:
- [cron-job.org](https://cron-job.org) 또는 [EasyCron](https://www.easycron.com)
- URL: `https://your-app.onrender.com/api/cron`
- 주기: 매 1분

## 사용법

### 일정 등록
자연어로 일정을 등록할 수 있습니다:
- "내일 오후 3시 회의"
- "12월 25일 크리스마스"
- "다음 주 월요일 오전 9시 출근"

### 알림 설정
- 일정 시간에 정확히 알림 발송
- 15분 전 사전 알림 발송
- Gmail을 통한 이메일 알림

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 라우트
│   ├── chat/           # 채팅 페이지
│   ├── profile/        # 사용자 설정
│   └── reminders/      # 일정 목록
├── components/         # React 컴포넌트
│   ├── ui/            # shadcn/ui 컴포넌트
│   └── ...
├── hooks/             # 커스텀 훅
├── services/          # 비즈니스 로직
├── storage/           # 데이터 저장소
└── types/             # TypeScript 타입
```

## 라이선스

MIT License