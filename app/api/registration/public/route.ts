import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({
  isPublic: z.boolean(),
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

  await db.user.update({
    where: { id: user.id },
    data: { isPublic: parsed.data.isPublic },
  });

  return NextResponse.json({ success: true });
}
