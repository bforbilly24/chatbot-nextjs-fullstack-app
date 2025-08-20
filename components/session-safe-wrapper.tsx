'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SessionSafeWrapperProps {
    children: (session: any) => React.ReactNode;
    fallback?: React.ReactNode;
}

export function SessionSafeWrapper({ children, fallback = null }: SessionSafeWrapperProps) {
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children(session)}</>;
}
