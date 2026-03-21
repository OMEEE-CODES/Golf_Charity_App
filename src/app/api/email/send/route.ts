import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/sender'
import {
  welcomeEmail,
  subscriptionEmail,
  drawResultsEmail,
  winnerEmail,
} from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json()

    if (!type || !to) {
      return NextResponse.json({ error: 'Missing type or to' }, { status: 400 })
    }

    let emailContent: { subject: string; html: string }

    switch (type) {
      case 'welcome':
        emailContent = welcomeEmail(data.name)
        break

      case 'subscription':
        emailContent = subscriptionEmail(
          data.name,
          data.plan,
          data.amount,
          data.nextDraw
        )
        break

      case 'draw_results':
        emailContent = drawResultsEmail(
          data.name,
          data.month,
          data.winningScores,
          data.userScores,
          data.matched
        )
        break

      case 'winner':
        emailContent = winnerEmail(
          data.name,
          data.tier,
          data.prize,
          data.month,
          data.notes
        )
        break

      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    const result = await sendEmail({ to, ...emailContent })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
