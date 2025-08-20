'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect, useRef } from 'react';
import { useSessionStore } from '@/lib/stores';

interface SessionWrapperProps {
    children: ReactNode;
}

function SessionSync() {
    const { data: session, status } = useSession();
    const { setUser, setLoading, user } = useSessionStore();
    const lastUserIdRef = useRef<string | null>(null);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        if (isProcessingRef.current) {
            return;
        }

        setLoading(status === 'loading');
        
        if (status === 'loading') {
            return;
        }

        isProcessingRef.current = true;

        try {
            if (session?.user) {
                const newUserId = session.user.id as string;
                
                if (lastUserIdRef.current !== newUserId) {
                    const newUser = {
                        id: newUserId,
                        name: session.user.name || '',
                        email: session.user.email || '',
                        image: session.user.image || undefined,
                        type: session.user.type as 'regular' | 'guest'
                    };
                    
                    setUser(newUser);
                    lastUserIdRef.current = newUserId;
                    
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('userChanged', { detail: newUser }));
                    }, 100);
                }
            } else {
                if (lastUserIdRef.current !== null) {
                    setUser(null);
                    lastUserIdRef.current = null;
                    
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('userChanged', { detail: null }));
                    }, 100);
                }
            }
        } finally {
            isProcessingRef.current = false;
        }
    }, [session?.user, status, setUser, setLoading]);

    return null;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
    return (
        <SessionProvider
            basePath="/api/auth"
            refetchInterval={0}
            refetchOnWindowFocus={false}
            refetchWhenOffline={false}
        >
            <SessionSync />
            {children}
        </SessionProvider>
    );
}
