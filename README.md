# Remind Up

AI 챗봇과 함께 일정을 예약하면 이메일로 일정을 알려주는 서비스입니다!

## 🚀 주요 기능

- **AI 챗봇**: "내일 오후 3시에 회의가 있어"와 같은 자연어로 일정 등록
- **일정 관리**: 등록, 수정, 삭제, 완료 상태 관리
- **이메일 알림**: 정시 알림, 사전 알림, 일일 요약
- **사용자 관리**: 프로필 설정 및 알림 설정

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, OpenAI GPT, Nodemailer
- **상태 관리**: Zustand, React Hook Form
- **배포**: Render

## 🚀 시작하기

### 1. 설치 및 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2048

# 이메일 설정 (Gmail)
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📱 사용 방법

1. **프로필 설정**: 이메일 주소 입력
2. **AI 챗봇**: 자연어로 일정 입력
3. **일정 관리**: 등록된 일정 확인 및 관리
4. **이메일 알림**: 자동으로 알림 수신

## 🔧 API 엔드포인트

- `POST /api/ai/parse-reminder`: 자연어를 일정 데이터로 변환
- `GET /api/notifications/cron`: 서버 사이드 알림 체크
- `POST /api/send-email`: 이메일 발송
- `POST /api/sync-data`: 데이터 동기화

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── chat/              # AI 챗봇 페이지
│   ├── reminders/         # 일정 관리 페이지
│   └── profile/           # 사용자 프로필 페이지
├── components/            # React 컴포넌트
├── services/              # 비즈니스 로직
├── hooks/                 # 커스텀 React 훅
├── types/                 # TypeScript 타입 정의
└── storage/               # 데이터 저장소
```

## 🚀 배포

Render에서 자동 배포됩니다. `render.yaml` 설정을 참고하세요.

## 📄 라이선스

MIT License

---

**메시지 리마인더**로 더 스마트한 일정 관리를 시작해보세요! 🚀