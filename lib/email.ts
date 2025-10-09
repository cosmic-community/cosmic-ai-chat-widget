import { Resend } from 'resend'
import { Message } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNewMessageNotification(
  message: Message,
  conversationId: string,
  visitorEmail?: string,
  visitorName?: string
) {
  try {
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'team@example.com'

    await resend.emails.send({
      from: 'Chat Widget <notifications@yourdomain.com>',
      to: notificationEmail,
      subject: `New chat message from ${visitorName || 'Visitor'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Chat Message Received</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${visitorName || 'Anonymous Visitor'}</p>
            ${visitorEmail ? `<p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${visitorEmail}</p>` : ''}
            <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${new Date(message.metadata.timestamp).toLocaleString()}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;">
              <p style="margin: 0; white-space: pre-wrap;">${message.metadata.content}</p>
            </div>
          </div>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversationId}" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Conversation
            </a>
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error }
  }
}

export async function sendAutoReply(
  conversationId: string,
  visitorEmail: string,
  visitorName?: string
) {
  try {
    await resend.emails.send({
      from: 'Support Team <support@yourdomain.com>',
      to: visitorEmail,
      subject: 'We received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Thank You for Contacting Us</h2>
          <p>Hi ${visitorName || 'there'},</p>
          <p>We've received your message and our team will get back to you as soon as possible.</p>
          <p>In the meantime, you can continue the conversation through the chat widget on our website.</p>
          <p style="margin-top: 30px;">Best regards,<br>The Support Team</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending auto-reply:', error)
    return { success: false, error }
  }
}