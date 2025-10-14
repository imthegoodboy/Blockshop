"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Input } from "./ui";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "👋 Hi! I'm your marketplace assistant. I can help you with buying, selling, or any questions about the platform!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.map(m => m.content).concat(userMessage) })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "Sorry, I couldn't process that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2" style={{ borderColor: 'var(--primary)' }}>
          <div className="primary-gradient text-white p-4 rounded-t-2xl flex items-center justify-between">
            <h3 className="font-bold text-lg">🤖 Marketplace Helper</h3>
            <button onClick={() => setIsOpen(false)} className="text-2xl hover:opacity-80">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}


