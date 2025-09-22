# GPT 모델 설정 가이드

## 개요

메시지 리마인더 v3에서는 OpenAI GPT 모델을 사용하여 더 정확하고 자연스러운 일정 파싱을 제공합니다. 이 가이드는 GPT 모델과 설정을 커스터마이징하는 방법을 설명합니다.

## 환경변수 설정

### 1. 기본 API 키 설정

```bash
# .env.local 파일에 추가
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. 고급 설정 (선택사항)

```bash
# GPT 모델 선택
OPENAI_MODEL=gpt-4
# 또는
OPENAI_MODEL=gpt-3.5-turbo

# 창의성 수준 (0.0 ~ 2.0)
OPENAI_TEMPERATURE=0.3

# 최대 토큰 수
OPENAI_MAX_TOKENS=500
```

## 사용 가능한 GPT 모델

### 1. GPT-3.5-turbo (기본값)
- **장점**: 빠른 응답, 저렴한 비용
- **용도**: 일반적인 일정 파싱
- **비용**: $0.0015/1K 토큰 (입력), $0.002/1K 토큰 (출력)

### 2. GPT-4
- **장점**: 더 정확한 파싱, 복잡한 문맥 이해
- **용도**: 복잡한 일정이나 특수한 요청
- **비용**: $0.03/1K 토큰 (입력), $0.06/1K 토큰 (출력)

### 3. GPT-4-turbo
- **장점**: GPT-4의 성능 + 더 빠른 응답
- **용도**: 고품질 파싱이 필요한 경우
- **비용**: $0.01/1K 토큰 (입력), $0.03/1K 토큰 (출력)

## Temperature 설정 가이드

Temperature는 AI의 창의성과 일관성을 조절합니다:

- **0.0**: 매우 일관적이고 예측 가능한 응답
- **0.3**: 균형잡힌 응답 (기본값, 권장)
- **0.7**: 더 창의적이고 다양한 응답
- **1.0**: 매우 창의적이지만 불일치 가능성

### 권장 설정:
- **일정 파싱**: 0.1-0.3 (정확성 우선)
- **일반 대화**: 0.3-0.7 (자연스러움 우선)

## Max Tokens 설정

Max tokens는 AI 응답의 최대 길이를 제한합니다:

- **200-300**: 간단한 응답
- **500**: 기본값 (권장)
- **1000**: 상세한 응답
- **2000**: 매우 상세한 응답

## 설정 예시

### 1. 기본 설정 (권장)
```bash
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500
```

### 2. 고품질 설정
```bash
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.1
OPENAI_MAX_TOKENS=800
```

### 3. 빠른 응답 설정
```bash
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.2
OPENAI_MAX_TOKENS=300
```

## 비용 최적화 팁

### 1. 모델 선택
- 일반적인 사용: GPT-3.5-turbo
- 중요한 일정: GPT-4
- 대량 사용: GPT-3.5-turbo

### 2. 토큰 최적화
- Max tokens를 필요한 만큼만 설정
- 불필요한 상세 설명 제거

### 3. 사용량 모니터링
- OpenAI 대시보드에서 사용량 확인
- 월별 예산 설정

## 문제 해결

### 1. API 키 오류
```
Error: Invalid API key
```
**해결방법**: API 키가 올바른지 확인하고 `.env.local` 파일을 다시 로드

### 1-1. 브라우저 보안 오류
```
Error: It looks like you're running in a browser-like environment
```
**해결방법**: 이 오류는 해결되었습니다. API 라우트를 통해 서버사이드에서 OpenAI를 호출합니다.

### 2. 모델 접근 권한 오류
```
Error: The model 'gpt-4' does not exist
```
**해결방법**: GPT-4 접근 권한이 있는지 확인하거나 GPT-3.5-turbo 사용

### 3. 토큰 한도 초과
```
Error: Maximum context length exceeded
```
**해결방법**: Max tokens 값을 줄이거나 입력 텍스트를 단축

### 4. 속도 문제
**해결방법**: 
- GPT-3.5-turbo 사용
- Max tokens 줄이기
- Temperature 낮추기

## 성능 모니터링

### 1. 응답 시간 측정
브라우저 개발자 도구 콘솔에서 로그 확인:
```
AI 서비스: 일정 파싱 시작
OpenAI API를 사용하여 파싱합니다.
useChat: AI 응답 받음
```

### 2. 정확도 평가
- 파싱된 제목의 적절성
- 날짜/시간 변환 정확성
- 사용자 만족도

### 3. 비용 추적
OpenAI 대시보드에서:
- 일일/월별 사용량
- 토큰 소비량
- 비용 분석

## 고급 설정

### 1. 커스텀 프롬프트
`aiService.ts`에서 system prompt 수정 가능:
```typescript
content: `당신은 전문적인 일정 관리 AI 어시스턴트입니다...`
```

### 2. 에러 처리
API 실패 시 정규식 폴백 자동 실행

### 3. 캐싱 (향후 구현 예정)
자주 사용되는 패턴에 대한 응답 캐싱

## 보안 고려사항

### 1. API 키 보호
- `.env.local` 파일을 `.gitignore`에 추가
- API 라우트를 통해 서버사이드에서만 OpenAI 호출
- 클라이언트에서 API 키 노출 방지

### 2. 사용자 데이터
- 개인정보가 API로 전송되지 않도록 주의
- 민감한 정보는 로컬에서만 처리

## 결론

적절한 GPT 설정을 통해 더 정확하고 자연스러운 일정 파싱을 경험할 수 있습니다. 사용 목적과 예산에 따라 모델과 설정을 조정하세요.
