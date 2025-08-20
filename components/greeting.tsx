import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GreetingProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}

export const Greeting = ({ user }: GreetingProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getUserFirstName = () => {
        if (!mounted || !user?.name) return null;
        return user.name.split(' ')[0];
    };

    const firstName = getUserFirstName();

    return (
        <div
            key="overview"
            className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-semibold"
            >
                {firstName ? `Hey, ${firstName}!` : 'Hello there!'}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
                className="text-2xl text-zinc-500"
            >
                How can I help you today?
            </motion.div>
        </div>
    );
};
