# 🚀 Cosmic AI Chat Widget

![Chat Widget Preview](https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1200&h=300&fit=crop&auto=format)

A powerful embeddable chat widget that can be integrated into any website with a single line of code. Features AI-powered responses using Cosmic's AI capabilities, email notifications via Resend, and a secure dashboard for team management.

## ✨ Features

- 💬 **Embeddable Chat Widget** - Single line of code integration
- 🤖 **AI-Powered Responses** - Intelligent answers using Cosmic AI
- 📧 **Email Notifications** - Instant alerts via Resend when messages arrive
- 🔐 **Secure Dashboard** - Team member login and chat management
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🎨 **Customizable Design** - Matches your brand identity
- 💾 **Message History** - Complete conversation tracking
- 🌐 **Multi-Site Support** - Manage chats across multiple websites

## Clone this Project

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68e728043393cb29a91844c9&clone_repository=68e72f973393cb29a91844d6)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Create a chat widget that can be used on any website by dropping a line of code into the page. Use Resend to send email notifications when a chat message has been sent. Use Cosmic AI to provide answers to questions. Enable a dashboard backend with a page to have Cosmic team member login and access chats.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: Cosmic
- **Email**: Resend
- **AI**: Cosmic AI
- **Language**: TypeScript
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun installed
- A Cosmic account and bucket
- Resend API key
- Basic knowledge of React and Next.js

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd cosmic-chat-widget
```

2. **Install dependencies**
```bash
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Cosmic CMS Configuration (automatically provided)
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key

  # Resend Email Service (for notifications)
  RESEND_API_KEY=re_your-resend-api-key-here
  NOTIFICATION_EMAIL=your-email@example.com
  
  # NextAuth Configuration

4. **Run the development server**
```bash
bun run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Cosmic SDK Examples

### Fetching Chat Conversations

```typescript
import { cosmic } from '@/lib/cosmic'

export async function getConversations() {
  try {
    const response = await cosmic.objects
      .find({
        type: 'conversations'
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return response.objects
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    throw error
  }
}
```

### Creating a New Message

```typescript
export async function createMessage(conversationId: string, content: string) {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'messages',
      title: `Message ${Date.now()}`,
      metadata: {
        conversation_id: conversationId,
        content: content,
        sender_type: 'visitor',
        timestamp: new Date().toISOString()
      }
    })
    
    return response.object
  } catch (error) {
    throw new Error('Failed to create message')
  }
}
```

### Using Cosmic AI for Responses

```typescript
import { CosmicAI } from '@/lib/cosmic-ai'

export async function getAIResponse(question: string) {
  const ai = new CosmicAI()
  
  const response = await ai.chat({
    messages: [
      {
        role: 'user',
        content: question
      }
    ]
  })
  
  return response.choices[0].message.content
}
```

## 🎯 Cosmic CMS Integration

This application uses Cosmic as a headless CMS to manage:

- **Conversations**: Store all chat conversations with visitor information
- **Messages**: Individual messages within conversations
- **Team Members**: Authentication and access control
- **Widget Settings**: Customization options for the chat widget

All content is managed through the Cosmic dashboard at [https://app.cosmicjs.com](https://app.cosmicjs.com)

## 📧 Email Notifications

The app uses Resend to send email notifications when new chat messages arrive. Configure your email settings in the environment variables and customize the email templates in `/lib/email.ts`.

## 🔐 Team Dashboard

Access the team dashboard at `/dashboard/login` to:
- View all conversations
- Respond to visitor messages
- Manage team member access
- Configure widget settings

### Demo Login

A demo admin account is pre-configured in your Cosmic bucket:
- **Email**: `admin@example.com`
- **Password**: Stored securely in the `team_members` Object Type in Cosmic

To access the dashboard:
1. Navigate to `/dashboard/login`
2. Use the demo credentials to sign in
3. You'll be redirected to the dashboard where you can manage conversations

### Creating Additional Team Members

To add more team members:
1. Log into your Cosmic dashboard
2. Navigate to the "Team Members" Object Type
3. Create a new team member with:
   - Email address
   - Hashed password (use bcrypt with salt rounds of 10)
   - Full name
   - Role (Admin or Member)

**Note**: Passwords must be hashed using bcrypt before storing in Cosmic. You can use the `hashPassword` utility function from `lib/auth.ts` or any bcrypt tool to generate the hash.

## 🌐 Widget Integration

To add the chat widget to any website, add this code before the closing `</body>` tag:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.setAttribute('data-cosmic-widget', 'YOUR_WIDGET_ID');
    document.body.appendChild(script);
  })();
</script>
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Variables for Production

Make sure to add all environment variables in your deployment platform:
- `COSMIC_BUCKET_SLUG`
- `COSMIC_READ_KEY`
- `COSMIC_WRITE_KEY`
- `RESEND_API_KEY` (Get your API key from [Resend Dashboard](https://resend.com/api-keys))
- `NOTIFICATION_EMAIL` (Email address where you want to receive chat notifications)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `WIDGET_SECRET`

### Setting Up Email Notifications

1. **Get your Resend API Key:**
   - Sign up at [Resend](https://resend.com)
   - Navigate to [API Keys](https://resend.com/api-keys) in your dashboard
   - Create a new API key
   - Add it as `RESEND_API_KEY` in your environment variables

2. **Configure notification email:**
   - Set `NOTIFICATION_EMAIL` to the email address where you want to receive chat notifications
   - Example: `NOTIFICATION_EMAIL=support@yourdomain.com`

3. **Update email sender domain:**
   - In `lib/email.ts`, update the `from` addresses to use your verified domain
   - Resend requires domain verification for production use
   - See [Resend Domains](https://resend.com/domains) for verification steps
## 📖 Learn More

- [Cosmic Documentation](https://www.cosmicjs.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

<!-- README_END -->