'use client';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon: React.ReactNode;
    }[];
    onItemClick?: (href: string) => void;
    activeItem?: string;
}

export function SidebarNav({ className, items, onItemClick, activeItem, ...props }: SidebarNavProps) {
    const [internalActiveItem, setInternalActiveItem] = useState(items[0]?.href || '');
    const currentActiveItem = activeItem || internalActiveItem;

    const handleItemClick = (href: string) => {
        if (onItemClick) {
            onItemClick(href);
        } else {
            setInternalActiveItem(href);
        }
    };

    return (
        <nav
            className={cn(
                'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <button
                    key={item.href}
                    onClick={() => handleItemClick(item.href)}
                    className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        currentActiveItem === item.href
                            ? 'bg-muted hover:bg-muted'
                            : 'hover:bg-transparent hover:underline',
                        'justify-start gap-2'
                    )}
                >
                    {item.icon}
                    {item.title}
                </button>
            ))}
        </nav>
    );
}
