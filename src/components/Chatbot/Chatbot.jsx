import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Minimize2,
  Maximize2,
  Mic,
  MessageCircle,
} from "lucide-react";
import chatbotService from "../../services/chatbotService";
import "./Chatbot.css";

const Chatbot = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "mama",
      message: `Hi ${userName || "there"}! 👋 I'm Mama, your AI shopping assistant. How can I help you today?`,
      timestamp: new Date(),
      quickReplies: ["Browse products", "Track order", "Contact support"],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      sender: "user",
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get AI response
      const response = await chatbotService.chat(inputMessage, userId);

      // Simulate typing delay
      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
    }
  };

  // Handle quick reply click
  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button className="chatbot-float-btn" onClick={() => setIsOpen(true)}>
          <MessageCircle size={24} />
          <span className="chat-badge">AI</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="mama-avatar">
                <span>🤖</span>
              </div>
              <div>
                <h3>Mama AI</h3>
                <p className="status">
                  <span className="status-dot"></span>
                  Always here to help
                </p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="header-btn"
              >
                {isMinimized ? (
                  <Maximize2 size={18} />
                ) : (
                  <Minimize2 size={18} />
                )}
              </button>
              <button onClick={() => setIsOpen(false)} className="header-btn">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          {!isMinimized && (
            <>
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    {msg.sender === "mama" && (
                      <div className="message-avatar">🤖</div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">{msg.message}</div>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    {msg.sender === "user" && (
                      <div className="message-avatar user-avatar">
                        {userName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="message mama">
                    <div className="message-avatar">🤖</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                {/* Quick replies */}
                {messages[messages.length - 1]?.quickReplies?.length > 0 &&
                  !isTyping && (
                    <div className="quick-replies">
                      {messages[messages.length - 1].quickReplies.map(
                        (reply, idx) => (
                          <button
                            key={idx}
                            className="quick-reply-btn"
                            onClick={() => handleQuickReply(reply)}
                          >
                            {reply}
                          </button>
                        ),
                      )}
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="chatbot-input-area">
                <button className="input-icon-btn" title="Voice input">
                  <Mic size={20} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="chatbot-input"
                />
                <button
                  onClick={handleSendMessage}
                  className="send-btn"
                  disabled={!inputMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
