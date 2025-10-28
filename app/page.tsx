"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatGPTInterface from "@/components/ChatGPTInterface";

export default function HomePage() {
  const handleNewChat = () => {
    // Open a new tab with the same URL
    window.open(window.location.href, '_blank');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + O for new chat
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onNewChat={handleNewChat} />
      <ChatGPTInterface onNewChat={handleNewChat} />
    </div>
  );
}
