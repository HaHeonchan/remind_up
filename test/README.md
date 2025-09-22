# 메시지 리마인더 (Message Reminder)

AI 챗봇과 함께 일정을 관리하고 이메일 알림을 받는 웹 애플리케이션입니다.

## 주요 기능

- **AI 챗봇**: 자연어로 일정을 입력하면 AI가 자동으로 날짜, 시간, 제목을 파싱
- **일정 관리**: 등록된 일정을 확인하고 수정, 삭제, 완료 상태 관리
- **사용자 설정**: 이메일 주소와 알림 설정 관리
- **이메일 알림**: 설정된 시간에 일정 알림 이메일 발송

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Storage**: localStorage (최소 스펙)
- **AI**: 정규식 기반 자연어 파싱

## Getting Started

개발 서버를 실행합니다:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인할 수 있습니다.

## 사용 방법

1. **사용자 정보 입력**: 프로필 페이지에서 이메일 주소를 입력하세요
2. **Gmail 설정**: 프로필 페이지의 "이메일 설정" 탭에서 Gmail 봇 계정을 설정하세요
3. **AI와 대화**: "내일 오후 3시에 회의가 있어"라고 말하면 AI가 자동으로 파싱합니다
4. **일정 확인**: 일정 목록에서 등록된 일정을 확인하고 관리하세요

## Gmail 설정 방법

### 1. Gmail 봇 계정 준비
1. Gmail 계정에서 **2단계 인증** 활성화
2. Google 계정 설정 → 보안 → 2단계 인증 → **앱 비밀번호**
3. '메일' 앱을 선택하고 **16자리 앱 비밀번호** 생성

### 2. 환경 변수 설정 (선택사항)
프로젝트 루트에 `.env.local` 파일 생성:
```bash
# Gmail 봇 계정 설정
GMAIL_USER=your-gmail-bot@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

# SMTP 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# OpenAI API 설정 (선택사항 - 설정하면 더 정확한 AI 파싱 사용)
OPENAI_API_KEY=your-openai-api-key-here

# GPT 모델 설정 (선택사항)
OPENAI_MODEL=gpt-3.5-turbo  # 또는 gpt-4, gpt-4-turbo
OPENAI_TEMPERATURE=0.3      # 창의성 수준 (0.0-2.0)
OPENAI_MAX_TOKENS=500       # 최대 응답 길이
```

### 3. 앱에서 설정
1. 프로필 페이지 → **이메일 설정** 탭
2. Gmail 계정과 앱 비밀번호 입력
3. **연결 테스트** 버튼으로 설정 확인
4. **테스트 이메일 발송**으로 실제 동작 확인

### 4. 이메일 알림 기능
- 일정 생성 시 자동으로 이메일 알림 발송
- HTML 형태의 예쁜 이메일 템플릿
- 일정 요약 이메일 발송 가능

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── chat/              # AI 챗봇 페이지
│   ├── reminders/         # 일정 관리 페이지
│   ├── profile/           # 사용자 설정 페이지
│   └── layout.tsx         # 레이아웃
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── ChatBot.tsx       # AI 챗봇 컴포넌트
│   ├── ReminderList.tsx  # 일정 목록 컴포넌트
│   ├── ReminderForm.tsx  # 일정 등록/수정 폼
│   ├── UserProfile.tsx   # 사용자 정보 폼
│   └── Navigation.tsx    # 네비게이션
├── hooks/                # 커스텀 React Hooks
│   ├── useReminders.ts   # 일정 관리 훅
│   ├── useUser.ts        # 사용자 관리 훅
│   └── useChat.ts        # 챗봇 훅
├── services/             # 비즈니스 로직
│   ├── aiService.ts      # AI 챗봇 서비스
│   ├── reminderService.ts # 일정 관리 서비스
│   ├── userService.ts    # 사용자 관리 서비스
│   └── emailService.ts   # 이메일 알림 서비스
├── storage/              # 데이터 저장소
│   ├── localStorage.ts   # 로컬 스토리지 서비스
│   └── jsonStorage.ts    # JSON 데이터 관리
└── types/                # TypeScript 타입 정의
    ├── reminder.ts       # 일정 타입
    ├── user.ts          # 사용자 타입
    └── chat.ts          # 챗봇 타입
```

## 기본 포함 라이브러리

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Shadcn UI](https://ui.shadcn.com)
- [Lucide Icon](https://lucide.dev)
- [date-fns](https://date-fns.org)
- [react-use](https://github.com/streamich/react-use)
- [es-toolkit](https://github.com/toss/es-toolkit)
- [Zod](https://zod.dev)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [TS Pattern](https://github.com/gvergnaud/ts-pattern)

## GPT 설정 가이드

더 자세한 GPT 모델 설정 방법은 [GPT 설정 가이드](docs/gpt-configuration.md)를 참고하세요.

## 사용 가능한 명령어

한글버전 사용

```sh
easynext lang ko
```

최신버전으로 업데이트

```sh
npm i -g @easynext/cli@latest
# or
yarn add -g @easynext/cli@latest
# or
pnpm add -g @easynext/cli@latest
```

Supabase 설정

```sh
easynext supabase
```

Next-Auth 설정

```sh
easynext auth

# ID,PW 로그인
easynext auth idpw
# 카카오 로그인
easynext auth kakao
```

유용한 서비스 연동

```sh
# Google Analytics
easynext gtag

# Microsoft Clarity
easynext clarity

# ChannelIO
easynext channelio

# Sentry
easynext sentry

# Google Adsense
easynext adsense
```
