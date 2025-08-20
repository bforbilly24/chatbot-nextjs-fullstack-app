'use client';

import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  userId: string;
  visibility: 'private';
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  removeChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChats: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  
  setChats: (chats) => set({ chats }),
  
  setCurrentChat: (currentChat) => set({ currentChat }),
  
  addChat: (chat) => 
    set((state) => ({ 
      chats: [chat, ...state.chats] 
    })),
  
  updateChat: (chatId, updates) => 
    set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
      currentChat: state.currentChat?.id === chatId 
        ? { ...state.currentChat, ...updates } 
        : state.currentChat
    })),
  
  removeChat: (chatId) => 
    set((state) => ({
      chats: state.chats.filter(chat => chat.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat
    })),
  
  addMessage: (chatId, message) => 
    set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      ),
      currentChat: state.currentChat?.id === chatId
        ? { ...state.currentChat, messages: [...state.currentChat.messages, message] }
        : state.currentChat
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearChats: () => set({ 
    chats: [], 
    currentChat: null, 
    error: null 
  })
}));
