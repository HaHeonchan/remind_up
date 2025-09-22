import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { text, userEmail, existingReminders, isUpdateRequest } = await request.json();

    if (!text || !userEmail) {
      return NextResponse.json(
        { error: '텍스트와 사용자 이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 현재 시간 정보 생성
    const now = new Date();
    const currentTime = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
      day: now.getDay(), // 0: 일요일, 1: 월요일, ...
      hour: now.getHours(),
      minute: now.getMinutes(),
      timeString: now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      dateString: now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    };

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenAI API 키가 설정되지 않았습니다.',
          fallback: true 
        },
        { status: 500 }
      );
    }

    // OpenAI 클라이언트 초기화
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // GPT 모델 설정
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    const maxCompletionTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "2048");

    // GPT API 호출
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
            content: `일정 관리 AI입니다. 사용자 메시지를 분석하여 JSON으로 응답하세요.

현재 날짜: ${new Date().toISOString().split('T')[0]}

응답 형식 (정확히 이 형식으로만 응답):
{
  "messageType": "reminder" | "general",
  "hasEnoughInfo": true | false,
  "reminderData": {
    "title": "제목",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "description": "설명"
  } | null,
  "response": "사용자에게 보낼 메시지"
}

규칙:
1. 날짜 정보가 없으면 messageType: "general"
2. 날짜 정보가 있으면 messageType: "reminder"
3. 날짜는 반드시 YYYY-MM-DD 형식 (예: 2024-12-25)
4. 오늘: ${new Date().toISOString().split('T')[0]}
5. 내일: ${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}

예시:
- "안녕" → {"messageType": "general", "hasEnoughInfo": false, "reminderData": null, "response": "안녕하세요!"}
- "내일 3시 회의" → {"messageType": "reminder", "hasEnoughInfo": true, "reminderData": {"title": "회의", "date": "${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}", "time": "15:00", "description": ""}, "response": "내일 3시 회의가 등록되었습니다."}`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_completion_tokens: maxCompletionTokens
    });

    const response = completion.choices[0]?.message?.content;
    console.log('OpenAI API 원본 응답:', response);
    
    if (!response) {
      console.error('OpenAI API 응답이 비어있음');
      return NextResponse.json({
        messageType: "general",
        reminderData: null,
        response: "죄송합니다. AI 응답을 받지 못했습니다. 다시 시도해주세요."
      });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log('AI 응답:', JSON.stringify(parsedResponse, null, 2));
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', response);
      return NextResponse.json({
        messageType: "general",
        reminderData: null,
        response: "죄송합니다. AI 응답 형식에 오류가 있습니다. 다시 시도해주세요."
      });
    }
    
    // 날짜 유효성 검증
    if (parsedResponse.reminderData && parsedResponse.reminderData.date) {
      console.log('AI가 생성한 날짜:', parsedResponse.reminderData.date);
      const date = new Date(parsedResponse.reminderData.date);
      console.log('파싱된 날짜 객체:', date);
      console.log('날짜 유효성:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.error('AI가 생성한 유효하지 않은 날짜:', parsedResponse.reminderData.date);
        // 유효하지 않은 날짜인 경우 일반 대화로 처리
        return NextResponse.json({
          messageType: "general",
          reminderData: null,
          response: "죄송합니다. 날짜 형식에 오류가 있습니다. 다시 시도해주세요."
        });
      }
    }
    
    if (isUpdateRequest) {
      // 일정 수정 요청 처리
      if (parsedResponse.hasEnoughInfo && parsedResponse.updateData) {
        return NextResponse.json({
          messageType: "update",
          reminderData: null,
          response: parsedResponse.response,
          updateData: parsedResponse.updateData
        });
      } else {
        return NextResponse.json({
          messageType: "update",
          reminderData: null,
          response: parsedResponse.response,
          needsMoreInfo: true,
          missingFields: parsedResponse.missingFields || []
        });
      }
    } else {
      // 일반 메시지 처리 (일정 생성 또는 일반 대화)
      if (parsedResponse.messageType === "general") {
        // 일반 대화 처리
        return NextResponse.json({
          messageType: "general",
          reminderData: null,
          response: parsedResponse.response
        });
      } else if (parsedResponse.messageType === "reminder") {
        // 일정 생성 요청 처리
        if (parsedResponse.hasEnoughInfo && parsedResponse.reminderData) {
          const reminderData = {
            ...parsedResponse.reminderData,
            email: userEmail
          };
          
          return NextResponse.json({
            messageType: "reminder",
            reminderData,
            response: parsedResponse.response
          });
        } else {
          return NextResponse.json({
            messageType: "reminder",
            reminderData: null,
            response: parsedResponse.response,
            needsMoreInfo: true,
            missingFields: parsedResponse.missingFields || []
          });
        }
      } else {
        // 기본값으로 일반 대화 처리
        return NextResponse.json({
          messageType: "general",
          reminderData: null,
          response: parsedResponse.response
        });
      }
    }

  } catch (error) {
    console.error('AI API 오류:', error);
    
    // JSON 파싱 오류인 경우
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱할 수 없습니다.',
          fallback: true 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'AI API 호출 중 오류가 발생했습니다.',
        fallback: true 
      },
      { status: 500 }
    );
  }
}