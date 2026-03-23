import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const user = await getUserFromCookies(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { telegramChatId: null },
  });

  return NextResponse.json({ success: true });
}
