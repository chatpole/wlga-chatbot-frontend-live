"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Copy, Check, Mic, MicOff } from "lucide-react";
import { chatApi } from "@/lib/api-config";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function formatMessageText(text: string) {
  const lines = text.split("\n");
  const formattedLines: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^#{1,6}\s+/)) {
      const headingText = trimmedLine.replace(/^#{1,6}\s+/, "");
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const headingClass = level === 1 ? "text-xl font-bold" : 
                          level === 2 ? "text-lg font-bold" : 
                          "text-base font-semibold";
      formattedLines.push(
        <div
          key={index}
          className={`${headingClass} text-gray-900 mt-4 mb-2 first:mt-0`}
        >
          {headingText}
        </div>
      );
    } else if (
      trimmedLine.endsWith(":") &&
      trimmedLine.length > 3 &&
      trimmedLine.length < 50 &&
      !trimmedLine.includes("http")
    ) {
      formattedLines.push(
        <div
          key={index}
          className="font-semibold text-gray-900 mt-3 mb-1 first:mt-0"
        >
          {trimmedLine}
        </div>
      );
    } else if (
      trimmedLine === trimmedLine.toUpperCase() &&
      trimmedLine.length > 3 &&
      trimmedLine.length < 50 &&
      /^[A-Z\s\d\-_]+$/.test(trimmedLine) &&
      !trimmedLine.includes("HTTP")
    ) {
      formattedLines.push(
        <div
          key={index}
          className="font-semibold text-gray-900 mt-3 mb-2 first:mt-0 underline"
        >
          {trimmedLine}
        </div>
      );
    } else if (trimmedLine.match(/^(\d+\.|•|\*|-)\s*[A-Z]/)) {
      const parts = trimmedLine.split(/^(\d+\.|•|\*|-)\s*/);
      if (parts.length >= 3) {
        const bullet = parts[1];
        const content = parts[2];
        if (content.endsWith(":") && content.length < 40) {
          formattedLines.push(
            <div key={index} className="font-semibold text-gray-900 mt-2 mb-1">
              {bullet} {content}
            </div>
          );
        } else {
          formattedLines.push(
            <div key={index} className="mt-1 flex items-start">
              <span className="font-semibold mr-2">{bullet}</span> 
              <span>{content}</span>
            </div>
          );
        }
      } else {
        formattedLines.push(
          <div key={index} className="mt-1">
            {trimmedLine}
          </div>
        );
      }
    } else if (trimmedLine) {
      formattedLines.push(
        <div key={index} className="mt-1 first:mt-0 leading-relaxed">
          {trimmedLine}
        </div>
      );
    } else {
      formattedLines.push(<div key={index} className="h-2"></div>);
    }
  });

  return <div className="space-y-1">{formattedLines}</div>;
}

function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group">
      <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-shrink-0">
          {message.isUser ? (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 leading-relaxed">
            {formatMessageText(message.text)}
          </div>
          
          {!message.isUser && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex items-start space-x-4 p-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

interface ChatGPTInterfaceProps {
  onNewChat: () => void;
}

export default function ChatGPTInterface({ onNewChat }: ChatGPTInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Sample LPG questions
  const sampleQuestions = [
    "Can you tell me about the renewable LPG project in Chile? Sounds interesting!",
    "I'm setting up a commercial kitchen - what should I know about using LPG safely?",
    "How does LPG work with fuel cells? Is it a good alternative energy source?",
    "What's happening with LPG adoption in Africa? Any success stories?",
    "Can LPG be used in emergency situations or disaster relief?",
    "How can LPG help in refugee camps and emergency situations?",
    "What are the benefits of using LPG in humanitarian aid?",
    "How does LPG compare to other fuels in disaster relief operations?",
    "What challenges do humanitarian organizations face when using LPG?",
    "Can LPG be used for cooking in refugee settlements?",
    "What safety measures are needed for LPG in humanitarian settings?",
    "What's the plan for expanding LPG use across Africa?",
    "Which African countries are leading in LPG adoption?",
    "What are the main barriers to LPG growth in Africa?",
    "How can LPG help improve energy access in rural Africa?",
    "What infrastructure is needed for LPG distribution in Africa?",
    "Are there any success stories of LPG projects in Africa?",
    "What are the prospects for LPG as marine fuel?",
    "How is the renewable LPG project in Chile performing?",
    "What are the latest LPG market statistics and trends?",
    "What best practices exist for LPG in institutional kitchens?",
    "How can LPG be used in fuel cell technology?"
  ];

  const handleSampleQuestion = (question: string) => {
    setInput(question);
    // Auto-send the question
    setTimeout(() => {
      handleSendQuestion(question);
    }, 100);
  };

  const handleSendQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: questionText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(questionText, sessionId);

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (!data.response && data.session_id && data.session_id !== sessionId) {
        setMessages([]);
        setSessionId(data.session_id);
        localStorage.setItem("chat-session-id", data.session_id);
        setIsLoading(false);
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.response ||
          "I apologize, but I couldn't process your request at the moment. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, but I'm having trouble connecting to the server right now. Please check your internet connection and try again later.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-session-id");
      if (saved) {
        setSessionId(saved);
      } else {
        const newId = crypto.randomUUID();
        localStorage.setItem("chat-session-id", newId);
        setSessionId(newId);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll capture when mouse is over chat
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const scrollAmount = e.deltaY * 0.8;
      chatContainer.scrollTop += scrollAmount;
    };

    const handleMouseEnter = () => {
      chatContainer.addEventListener('wheel', handleWheel, { passive: false });
      chatContainer.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      chatContainer.removeEventListener('wheel', handleWheel);
      chatContainer.style.cursor = 'default';
    };

    chatContainer.addEventListener('mouseenter', handleMouseEnter);
    chatContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      chatContainer.removeEventListener('mouseenter', handleMouseEnter);
      chatContainer.removeEventListener('mouseleave', handleMouseLeave);
      chatContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userInput = input.toLowerCase().trim();
    const whoAreYouPatterns = [
      "who are you",
      "what are you",
      "who r u",
      "what r u",
      "tell me about yourself",
      "introduce yourself",
      "what is your name",
      "whats your name",
    ];

    const isWhoAreYouQuestion = whoAreYouPatterns.some((pattern) =>
      userInput.includes(pattern)
    );

    if (isWhoAreYouQuestion) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm WLGA AI Assistant, your intelligent companion powered by advanced language models. I'm here to help you with information, automation, and support - all crafted by the WLGA team. I can assist with a wide range of topics and tasks. What would you like to know or discuss?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    await handleSendQuestion(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto chat-messages-container"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center max-w-4xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to WLGA AI Assistant
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your intelligent companion for LPG industry insights and expertise. 
                  Click on any question below to get started, or type your own question.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
                  {sampleQuestions.slice(0, 12).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 group"
                    >
                      <p className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">
                        {question}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
                      handleSampleQuestion(randomQuestion);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium"
                  >
                    Ask a Random Question
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message WLGA AI Assistant..."
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-500 text-sm leading-relaxed"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  className={`p-1.5 transition-colors duration-200 ${
                    isRecording 
                      ? "text-red-500 hover:text-red-600" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-2xl transition-all duration-200 flex items-center space-x-2 font-medium text-sm shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            WLGA AI Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
