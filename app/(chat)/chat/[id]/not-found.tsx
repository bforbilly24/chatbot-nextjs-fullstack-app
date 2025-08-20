'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const chatId = pathSegments[pathSegments.length - 1];

        toast.error(`Unable to load conversation ${chatId}`, {
            duration: 4000,
        });

        router.push('/');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        </div>
    );
}
