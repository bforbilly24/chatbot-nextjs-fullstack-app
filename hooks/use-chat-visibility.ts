'use client';

import { useMemo, useState, useEffect } from 'react';
import { updateChatVisibility } from '@/app/(chat)/actions';
import type { VisibilityType } from '@/components/visibility-selector';

export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  const [visibilityType, setLocalVisibility] = useState<VisibilityType>(initialVisibilityType);


  useEffect(() => {
    setLocalVisibility(initialVisibilityType);
  }, [initialVisibilityType]);

    const setVisibilityType = async (updatedVisibilityType: VisibilityType) => {
        setLocalVisibility(updatedVisibilityType);
        
        window.dispatchEvent(new CustomEvent('chatVisibilityChanged', { 
            detail: { chatId, visibility: updatedVisibilityType } 
        }));

        try {
            await updateChatVisibility({
                chatId: chatId,
                visibility: updatedVisibilityType,
            });
        } catch (error) {
            console.error('Failed to update chat visibility:', error);
            setLocalVisibility(initialVisibilityType);
        }
    };  return { visibilityType, setVisibilityType };
}
