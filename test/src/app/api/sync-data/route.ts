import { NextRequest, NextResponse } from 'next/server';
import { ServerStorageService } from '@/storage/serverStorage';
import { Reminder } from '@/types/reminder';
import { User } from '@/types/user';

// 클라이언트에서 서버 스토리지로 데이터 동기화
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    const serverStorage = ServerStorageService.getInstance();

    switch (type) {
      case 'reminder':
        await serverStorage.saveReminder(data as Reminder);
        break;
      case 'deleteReminder':
        await serverStorage.deleteReminder(data.id);
        break;
      case 'user':
        await serverStorage.saveUser(data as User);
        break;
      case 'reminders':
        await serverStorage.saveReminders(data as Reminder[]);
        break;
      case 'users':
        await serverStorage.saveUsers(data as User[]);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid sync type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error('Data sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Data sync failed' },
      { status: 500 }
    );
  }
}

// 서버 스토리지에서 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const serverStorage = ServerStorageService.getInstance();

    let data;
    switch (type) {
      case 'reminders':
        data = await serverStorage.getReminders();
        break;
      case 'users':
        data = await serverStorage.getUsers();
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid query type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Data fetch failed' },
      { status: 500 }
    );
  }
}
