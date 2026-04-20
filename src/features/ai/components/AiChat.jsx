/**
 * AI Page — Gemini AI Assistant module.
 * 
 * Securely communicates with Gemini AI via Firebase Cloud Functions
 * to protect API keys and handle complex logic.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bot, SendHorizonal, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import './AiChat.css';

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Prepare callable function
      const chatWithGemini = httpsCallable(functions, 'chatWithGemini');
      
      // 2. Call Cloud BFF
      const result = await chatWithGemini({ 
        prompt: input,
        // Optional: send history if you want a multi-turn conversation
        // history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
      });

      const aiResponse = { role: 'ai', content: result.data.text };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      
      let errorMessage = "Lo siento, tuve un problema al procesar tu solicitud. ¿Podrías intentar de nuevo?";
      if (error.code === 'functions/resource-exhausted' || error.message.includes('resource-exhausted') || error.message.includes('Free plan')) {
        errorMessage = "🔋 Batería de IA agotada: Has alcanzado tu límite gratuito inicial de 15 consultas mágicas. Para evitar la saturación de los servidores de Google, por favor actualiza a un plan Premium para uso ilimitado.";
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: errorMessage,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    // Optional: auto-send
    // setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="feature-page ai-chat">
      <header className="feature-page__header">
        <div className="feature-page__icon" style={{ background: 'var(--accent-gradient)', color: '#fff' }}>
          <Bot size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Gemini AI Assistant</h1>
          <p className="feature-page__desc">Your AI-powered life coach — context-aware and private.</p>
        </div>
      </header>

      <div className="ai-chat__container glass-panel">
        <div className={`ai-chat__messages ${messages.length === 0 ? 'ai-chat__messages--empty' : ''}`}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="ai-chat__welcome"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Bot size={48} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
                <h2>How can I help you today?</h2>
                <p>I can analyze your finance, health, and productivity data to give personalized suggestions.</p>
                <div className="ai-chat__suggestions">
                  {['Optimize my budget', 'Plan a workout routine', 'Summarize my week'].map(suggest => (
                    <button 
                      key={suggest} 
                      className="ai-chat__suggestion"
                      onClick={() => handleSuggestion(suggest)}
                    >
                      {suggest}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`ai-chat__message ai-chat__message--${msg.role}`}>
                  {msg.content}
                </div>
              ))
            )}
          </AnimatePresence>
          
          {isLoading && (
            <div className="ai-chat__message ai-chat__message--ai">
              <div className="ai-chat__loading">
                <div className="ai-chat__dot"></div>
                <div className="ai-chat__dot"></div>
                <div className="ai-chat__dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat__input-wrapper" onSubmit={handleSend}>
          <input
            type="text"
            className="ai-chat__input"
            placeholder="Ask anything about your life data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="ai-chat__send" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <SendHorizonal size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
