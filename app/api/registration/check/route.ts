import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const decoded = verifyUserToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isRegistered = !!user.repoOwner && !!user.repoName && !!user.workflowId

  return NextResponse.json({
    isRegistered,
    isAlive: user.isAlive,
    isPublic: user.isPublic,
    checkFreq: user.checkFreq,
    deadlineDays: user.deadlineDays,
    attemptsCount: user.attemptsCount,
    nextCheck: user.nextCheck,
    repo: isRegistered ? { owner: user.repoOwner, name: user.repoName } : null,
    workflow: isRegistered ? { id: user.workflowId, name: user.workflowName } : null,
    channels: {
      telegram: { connected: !!user.telegramChatId },
    },
  })
}
