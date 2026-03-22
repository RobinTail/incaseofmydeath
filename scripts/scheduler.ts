import { PrismaClient } from '@prisma/client'
import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

const db = new PrismaClient()

const msInDay = 86400000

function checkFreqToDays(freq: string): number {
  switch (freq) {
    case 'day':
      return 1
    case 'week':
      return 7
    case 'month':
      return 30
    case 'quarter':
      return 90
    case 'year':
      return 365
    default:
      return 30
  }
}

async function getInstallationToken(installationId: number): Promise<string> {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  })

  const octokit = new Octokit({ auth })
  const { data } = await octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    { installation_id: installationId }
  )

  return data.token
}

async function triggerWorkflow(
  installationId: number,
  owner: string,
  repo: string,
  workflowId: number,
  ref: string
): Promise<void> {
  const token = await getInstallationToken(installationId)
  const octokit = new Octokit({ auth: token })

  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner,
    repo,
    workflow_id: workflowId,
    ref,
  })
}

async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })
}

async function runCheckCycle(): Promise<void> {
  console.log('Starting scheduler check cycle...')

  const now = new Date()
  const dryRun = process.env.DRY_RUN === 'true'

  const users = await db.user.findMany({
    where: {
      isAlive: true,
      nextCheck: { lte: now },
      repoOwner: { not: '' },
      telegramChatId: { not: null },
    },
  })

  console.log(`Found ${users.length} users to check`)

  for (const user of users) {
    try {
      const deadline =
        user.lastConfirmation.getTime() +
        (checkFreqToDays(user.checkFreq) + user.deadlineDays) * msInDay

      const isPastDeadline = user.isCountdown && deadline < now.getTime()

      if (isPastDeadline) {
        console.log(`User ${user.id} is past deadline - marking as dead`)

        if (!dryRun) {
          await sendTelegramMessage(
            user.telegramChatId!,
            'According to our agreement I consider you dead.'
          )

          await triggerWorkflow(
            user.installationId,
            user.repoOwner,
            user.repoName,
            user.workflowId,
            user.repoBranch
          )

          await db.user.update({
            where: { id: user.id },
            data: {
              isAlive: false,
              isCountdown: false,
              lastConfirmation: new Date(),
            },
          })
        }
      } else {
        console.log(`User ${user.id} needs reminder`)

        if (!dryRun) {
          await sendTelegramMessage(
            user.telegramChatId!,
            'Are you alive? Please send me any message to confirm.'
          )
        }

        const newNextCheck = new Date(
          now.getTime() + (user.deadlineDays * msInDay) / (user.attemptsCount + 1)
        )

        await db.user.update({
          where: { id: user.id },
          data: {
            isCountdown: true,
            nextCheck: newNextCheck,
          },
        })
      }
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error)
    }
  }

  console.log('Scheduler check cycle completed')
}

runCheckCycle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Scheduler error:', error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
