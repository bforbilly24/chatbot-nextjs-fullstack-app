'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/stores';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useChatHistory() {
  const { chats, setChats, setLoading, setError } = useChatStore();
  
  const { data, error, isLoading, mutate } = useSWR('/api/history?limit=20', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    setLoading(isLoading);
    
    if (error) {
      setError(error.message || 'Failed to load chat history');
    } else {
      setError(null);
    }
    
    if (data) {
      setChats(data);
    }
  }, [data, error, isLoading, setChats, setLoading, setError]);

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
}
