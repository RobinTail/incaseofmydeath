import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getDefaultNextCheck } from '@/lib/utils';

const bodySchema = z.object({
  checkFreq: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  deadlineDays: z.number().min(1).max(30),
  attemptsCount: z.number().min(1).max(10),
});

export async function PATCH(request: NextRequest) {
  const user = await getUserFromCookies(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { checkFreq, deadlineDays, attemptsCount } = parsed.data;

  await db.user.update({
    where: { id: user.id },
    data: {
      checkFreq,
      deadlineDays,
      attemptsCount,
      nextCheck: getDefaultNextCheck(checkFreq),
      lastConfirmation: new Date(),
      isAlive: true,
      isCountdown: false,
    },
  });

  return NextResponse.json({ success: true });
}
