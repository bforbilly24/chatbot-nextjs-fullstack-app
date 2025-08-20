"use client";

import { siGoogle } from "simple-icons";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GoogleButton({ className, children, ...props }: React.ComponentProps<typeof Button>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/' });
    };

    if (!mounted) {
        return (
            <Button
                variant="secondary"
                className={cn(className)}
                disabled
                {...props}
            >
                <SimpleIcon icon={siGoogle} className="size-4" />
                {children || "Continue with Google"}
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            className={cn(className)}
            onClick={handleGoogleSignIn}
            {...props}
        >
            <SimpleIcon icon={siGoogle} className="size-4" />
            {children || "Continue with Google"}
        </Button>
    );
}
