(function() {
  'use strict';
  
  const widgetId = document.currentScript.getAttribute('data-cosmic-widget');
  const apiUrl = document.currentScript.src.replace('/widget.js', '');
  
  let conversationId = null;
  let messages = [];
  
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'cosmic-chat-widget';
    container.innerHTML = `
      <style>
        #cosmic-chat-widget * {
          box-sizing: border-box;
        }
        #cosmic-chat-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          transition: transform 0.2s;
        }
        #cosmic-chat-button:hover {
          transform: scale(1.1);
        }
        #cosmic-chat-button svg {
          width: 32px;
          height: 32px;
          color: white;
        }
        #cosmic-chat-window {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 384px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          display: none;
          flex-direction: column;
        }
        #cosmic-chat-window.open {
          display: flex;
        }
        #cosmic-chat-header {
          background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        #cosmic-chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        #cosmic-chat-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #cosmic-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .cosmic-message {
          margin-bottom: 16px;
          display: flex;
        }
        .cosmic-message.user {
          justify-content: flex-end;
        }
        .cosmic-message-content {
          max-width: 80%;
          padding: 12px;
          border-radius: 8px;
          word-wrap: break-word;
        }
        .cosmic-message.user .cosmic-message-content {
          background: #6366f1;
          color: white;
        }
        .cosmic-message.bot .cosmic-message-content {
          background: #f3f4f6;
          color: #1f2937;
        }
        #cosmic-chat-input-form {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        #cosmic-chat-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }
        #cosmic-chat-send {
          background: #6366f1;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        #cosmic-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
      
      <button id="cosmic-chat-button">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      
      <div id="cosmic-chat-window">
        <div id="cosmic-chat-header">
          <h3>Chat with us</h3>
          <button id="cosmic-chat-close">×</button>
        </div>
        <div id="cosmic-chat-messages"></div>
        <form id="cosmic-chat-input-form">
          <input type="text" id="cosmic-chat-input" placeholder="Type your message..." />
          <button type="submit" id="cosmic-chat-send">Send</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(container);
    
    const button = document.getElementById('cosmic-chat-button');
    const window = document.getElementById('cosmic-chat-window');
    const closeBtn = document.getElementById('cosmic-chat-close');
    const form = document.getElementById('cosmic-chat-input-form');
    const input = document.getElementById('cosmic-chat-input');
    const messagesContainer = document.getElementById('cosmic-chat-messages');
    
    button.addEventListener('click', () => {
      window.classList.add('open');
      button.style.display = 'none';
      if (!conversationId) {
        initChat();
      }
    });
    
    closeBtn.addEventListener('click', () => {
      window.classList.remove('open');
      button.style.display = 'block';
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(input.value);
      input.value = '';
    });
    
    async function initChat() {
      try {
        const response = await fetch(`${apiUrl}/api/widget/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteUrl: window.location.href,
          }),
        });
        
        const data = await response.json();
        conversationId = data.conversationId;
        
        addMessage('Hi! 👋 How can I help you today?', 'bot');
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    }
    
    async function sendMessage(content) {
      if (!content.trim() || !conversationId) return;
      
      addMessage(content, 'user');
      
      try {
        const response = await fetch(`${apiUrl}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            content,
            sendAIResponse: true,
          }),
        });
        
        const data = await response.json();
        
        if (data.aiMessage) {
          addMessage(data.aiMessage.metadata.content, 'bot');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    
    function addMessage(content, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `cosmic-message ${sender}`;
      messageDiv.innerHTML = `
        <div class="cosmic-message-content">${escapeHtml(content)}</div>
      `;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();