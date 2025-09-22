# 메시지 리마인더 (Message Reminder)

AI 챗봇과 함께 일정을 관리하고 이메일 알림을 받아보는 스마트한 일정 관리 서비스입니다.

## 🚀 주요 기능

### 1. AI 챗봇 일정 등록
- **자연어 처리**: "내일 오후 3시에 회의가 있어"와 같은 자연어로 일정 입력
- **자동 파싱**: AI가 자동으로 날짜, 시간, 제목을 추출하여 구조화된 데이터로 변환
- **실시간 대화**: OpenAI GPT 모델을 활용한 지능적인 대화형 인터페이스

### 2. 스마트 일정 관리
- **일정 목록**: 등록된 모든 일정을 한눈에 확인
- **완료 상태 관리**: 일정 완료/미완료 상태 토글
- **일정 수정**: 기존 일정 정보 수정 및 업데이트
- **일정 삭제**: 불필요한 일정 제거

### 3. 이메일 알림 시스템
- **정시 알림**: 일정 시간에 정확히 이메일 발송
- **사전 알림**: 일정 15분 전 사전 알림 (설정 가능)
- **일일 요약**: 매일 오전 9시 오늘의 일정 요약 발송
- **HTML 이메일**: 아름다운 HTML 형식의 이메일 템플릿

### 4. 사용자 관리
- **프로필 설정**: 이메일 주소 및 사용자 정보 관리
- **알림 설정**: 이메일 알림 활성화/비활성화
- **개인화**: 사용자별 맞춤형 일정 관리

## 🛠 기술 스택

### Frontend
- **Next.js 15**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui**: 접근성이 뛰어난 UI 컴포넌트 라이브러리
- **React Hook Form**: 폼 상태 관리 및 유효성 검사
- **Zustand**: 경량 전역 상태 관리

### Backend & AI
- **OpenAI GPT**: 자연어 처리 및 일정 파싱
- **Next.js API Routes**: 서버사이드 API 엔드포인트
- **Nodemailer**: 이메일 발송 서비스

### 데이터 관리
- **JSON Storage**: 클라이언트 사이드 데이터 저장
- **Server Storage**: 서버 사이드 데이터 동기화
- **Local Storage**: 브라우저 로컬 저장소 활용

### 개발 도구
- **ESLint**: 코드 품질 관리
- **TypeScript**: 정적 타입 검사
- **date-fns**: 날짜/시간 처리 라이브러리
- **ts-pattern**: 패턴 매칭을 통한 깔끔한 분기 처리

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── ai/           # AI 관련 API
│   │   ├── notifications/ # 알림 관련 API
│   │   └── send-email/   # 이메일 발송 API
│   ├── chat/             # AI 챗봇 페이지
│   ├── reminders/        # 일정 관리 페이지
│   └── profile/          # 사용자 프로필 페이지
├── components/           # React 컴포넌트
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── ChatBot.tsx      # AI 챗봇 컴포넌트
│   ├── ReminderForm.tsx # 일정 등록 폼
│   └── ReminderList.tsx # 일정 목록
├── services/            # 비즈니스 로직
│   ├── aiService.ts     # AI 서비스
│   ├── emailService.ts  # 이메일 서비스
│   ├── reminderService.ts # 일정 관리 서비스
│   └── notificationService.ts # 알림 서비스
├── hooks/               # 커스텀 React 훅
├── types/               # TypeScript 타입 정의
└── storage/             # 데이터 저장소
```

## 🚀 시작하기

### 1. 환경 설정

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

# 이메일 설정 (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 4. 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## 📱 사용 방법

### 1. 사용자 정보 입력
- 프로필 페이지에서 이메일 주소를 입력하세요
- 이메일 주소는 일정 알림을 받기 위해 필요합니다

### 2. AI 챗봇과 대화
- 챗봇 페이지에서 자연어로 일정을 입력하세요
- 예시: "내일 오후 3시에 회의가 있어", "12월 25일 크리스마스 파티"

### 3. 일정 확인 및 관리
- 일정 목록 페이지에서 등록된 일정을 확인하세요
- 완료된 일정은 체크박스로 표시할 수 있습니다
- 필요시 일정을 수정하거나 삭제할 수 있습니다

### 4. 이메일 알림 받기
- 일정 시간에 정확히 이메일 알림을 받습니다
- 15분 전 사전 알림도 받을 수 있습니다
- 매일 오전 9시에 오늘의 일정 요약을 받습니다

## 🔧 API 엔드포인트

### AI 관련
- `POST /api/ai/parse-reminder`: 자연어를 일정 데이터로 변환

### 알림 관련
- `GET /api/notifications/cron`: 서버 사이드 알림 체크
- `POST /api/notifications/test`: 알림 테스트

### 이메일 관련
- `POST /api/send-email`: 이메일 발송

### 데이터 동기화
- `POST /api/sync-data`: 클라이언트-서버 데이터 동기화

## 🎯 주요 특징

### 1. 지능적인 자연어 처리
- OpenAI GPT 모델을 활용한 고도화된 자연어 이해
- 다양한 날짜/시간 표현 방식 지원
- 맥락을 이해한 일정 파싱

### 2. 실시간 알림 시스템
- 매분마다 알림 체크하는 백그라운드 서비스
- 중복 알림 방지 메커니즘
- 사용자별 맞춤형 알림 설정

### 3. 반응형 UI/UX
- 모바일 친화적인 반응형 디자인
- 접근성을 고려한 UI 컴포넌트
- 직관적인 사용자 인터페이스

### 4. 확장 가능한 아키텍처
- 모듈화된 서비스 구조
- 타입 안전성을 보장하는 TypeScript
- 재사용 가능한 컴포넌트 설계

## 🔮 향후 계획

- [ ] 데이터베이스 연동 (Supabase/PostgreSQL)
- [ ] 사용자 인증 시스템
- [ ] 일정 공유 기능
- [ ] 캘린더 뷰 추가
- [ ] 모바일 앱 개발
- [ ] 다국어 지원
- [ ] 음성 입력 기능

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**메시지 리마인더**로 더 스마트한 일정 관리를 시작해보세요! 🚀