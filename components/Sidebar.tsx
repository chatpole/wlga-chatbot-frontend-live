"use client";

import React from "react";
import { 
  Plus, 
  Bot,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  onNewChat: () => void;
}

export default function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">WLGA AI</h1>
            <p className="text-xs text-gray-400">Assistant</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 group"
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="text-sm font-medium">New chat</span>
          <span className="text-xs text-gray-500 ml-auto">Ctrl + Shift + O</span>
        </button>
      </div>

      {/* Help Section */}
      <div className="flex-1 px-4 pt-4">
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 group">
            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Help & FAQ</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">W</span>
          </div>
          <div>
            <p className="text-sm font-medium">WLGA AI</p>
            <p className="text-xs text-gray-400">Powered by AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
