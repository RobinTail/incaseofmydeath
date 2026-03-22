import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function getUserById(id: number) {
  return db.user.findUnique({ where: { id } })
}

export async function getUserByTelegramChatId(chatId: string) {
  return db.user.findUnique({ where: { telegramChatId: chatId } })
}

export async function getUserByLogin(login: string) {
  return db.user.findFirst({
    where: {
      repoOwner: { equals: login, mode: 'insensitive' },
    },
  })
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function badRequestResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

export function notFoundResponse(error: string) {
  return NextResponse.json({ error }, { status: 404 })
}

export function serverErrorResponse(error: string) {
  return NextResponse.json({ error }, { status: 500 })
}
