// Base Cosmic object interface
export interface CosmicObject {
  id: string
  slug: string
  title: string
  content?: string
  metadata: Record<string, any>
  type: string
  created_at: string
  modified_at: string
}

// Conversation type
// Conversation type
export interface Conversation extends CosmicObject {
  type: 'conversations'
  metadata: {
    visitor_email?: string
    visitor_name?: string
    website_url?: string
    status: {
      key: string
      value: string
    }
    last_message?: string
    last_message_at?: string
    unread_count?: number
  }
}

// Message type
export interface Message extends CosmicObject {
  type: 'messages'
  metadata: {
    conversation_id: string
    content: string
    sender_type: MessageSenderType
    sender_name?: string
    ai_response?: boolean
    timestamp: string
  }
}

// Team member type
export interface TeamMember extends CosmicObject {
  type: 'team_members'
  metadata: {
    email: string
    password_hash: string
    full_name: string
    role: TeamMemberRole
    last_login?: string
  }
}

// Widget settings type
export interface WidgetSettings extends CosmicObject {
  type: 'widget_settings'
  metadata: {
    primary_color?: string
    welcome_message?: string
    placeholder_text?: string
    notification_email?: string
    ai_enabled?: boolean
    auto_respond?: boolean
  }
}

// Type literals
export type ConversationStatus = 'active' | 'resolved' | 'archived'
export type MessageSenderType = 'visitor' | 'team' | 'ai'
export type TeamMemberRole = 'admin' | 'member'

// API response types
export interface CosmicResponse<T> {
  objects: T[]
  total: number
  limit: number
  skip: number
}

// Widget configuration
export interface WidgetConfig {
  widgetId: string
  apiUrl: string
  primaryColor?: string
  welcomeMessage?: string
  placeholderText?: string
}

// Chat message for widget
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: string
  isTyping?: boolean
}

// Form data types
export interface SendMessageData {
  conversationId: string
  content: string
  visitorName?: string
  visitorEmail?: string
}

// NextAuth types
export interface User {
  id: string
  email: string
  name: string
  role: TeamMemberRole
}

// Type guards
export function isConversation(obj: CosmicObject): obj is Conversation {
  return obj.type === 'conversations'
}

export function isMessage(obj: CosmicObject): obj is Message {
  return obj.type === 'messages'
}

export function isTeamMember(obj: CosmicObject): obj is TeamMember {
  return obj.type === 'team_members'
}