"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

import {
    Search,
    MessageSquare,
    Plus,
    History,
    User,
    Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import type { Chat } from "@/lib/generated/prisma";

const searchItems = [
    { group: "Chat", icon: MessageSquare, label: "New Chat", href: "/" },
    { group: "Chat", icon: Plus, label: "Create Document", href: "/new" },
    { group: "Authentication", icon: User, label: "Login", href: "/v1/login" },
    { group: "Authentication", icon: User, label: "Register", href: "/v1/register" },
];

interface SearchDialogProps {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
    } | null;
}

export function SearchDialog({ user }: SearchDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [recentChats, setRecentChats] = React.useState<Chat[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (open && mounted && user?.id) {
            setLoading(true);
            fetch(`/api/history?limit=5`)
                .then(res => res.json())
                .then(data => {
                    setRecentChats(data.chats || []);
                })
                .catch(err => {
                    console.error('Failed to fetch recent chats:', err);
                    setRecentChats([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (!open) {
            setRecentChats([]);
            setLoading(false);
        }
    }, [open, mounted, user?.id]);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    return (
        <>
            <Button
                variant="ghost"
                className="relative h-8 w-full justify-start rounded-lg bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 size-4" />
                Search...
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>J
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {[...new Set(searchItems.map((item) => item.group))].map((group, i) => (
                        <React.Fragment key={group}>
                            {i !== 0 && <CommandSeparator />}
                            <CommandGroup heading={group} key={group}>
                                {searchItems
                                    .filter((item) => item.group === group)
                                    .map((item) => (
                                        <CommandItem
                                            key={item.label}
                                            onSelect={() => handleSelect(item.href || "/")}
                                            className="cursor-pointer"
                                        >
                                            {item.icon && <item.icon className="mr-2 size-4" />}
                                            <span>{item.label}</span>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </React.Fragment>
                    ))}

                    {/* Recent Chats Section */}
                    {user && (
                        <>
                            <CommandSeparator />
                            <CommandGroup heading="Recent Chats">
                                {loading ? (
                                    <CommandItem disabled>
                                        <Clock className="mr-2 size-4" />
                                        <span>Loading recent chats...</span>
                                    </CommandItem>
                                ) : recentChats.length > 0 ? (
                                    recentChats.map((chat) => (
                                        <CommandItem
                                            key={chat.id}
                                            onSelect={() => handleSelect(`/chat/${chat.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <Clock className="mr-2 size-4" />
                                            <span className="truncate">{chat.title}</span>
                                        </CommandItem>
                                    ))
                                ) : (
                                    <CommandItem disabled>
                                        <Clock className="mr-2 size-4" />
                                        <span>No recent chats</span>
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
