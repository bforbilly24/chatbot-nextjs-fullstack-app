'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useSessionStore } from '@/lib/stores';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    useSidebar,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/generated/prisma';
import { ChatItem } from './sidebar-history-item';

type GroupedChats = {
    today: Chat[];
    yesterday: Chat[];
    lastWeek: Chat[];
    lastMonth: Chat[];
    older: Chat[];
};

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
        (groups, chat) => {
            const chatDate = new Date(chat.createdAt);

            if (isToday(chatDate)) {
                groups.today.push(chat);
            } else if (isYesterday(chatDate)) {
                groups.yesterday.push(chat);
            } else if (chatDate > oneWeekAgo) {
                groups.lastWeek.push(chat);
            } else if (chatDate > oneMonthAgo) {
                groups.lastMonth.push(chat);
            } else {
                groups.older.push(chat);
            }

            return groups;
        },
        {
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        } as GroupedChats,
    );
};

interface ChatHistory {
    chats: Array<Chat>;
    hasMore: boolean;
}

export function SidebarHistory() {
    const { user, isLoading: userLoading } = useSessionStore();
    const { setOpenMobile } = useSidebar();
    const { id } = useParams();
    const router = useRouter();
    
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const isFetchingRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchChatHistory = useCallback(async () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!user || userLoading) {
            setChats([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (user.email === 'guest@example.com' || user.id?.startsWith('guest-')) {
            setChats([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch('/api/history?limit=100');
                
                if (!response.ok) {
                    if (response.status === 401) {
                        setChats([]);
                        setError(null);
                        return;
                    }
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                
                const data: ChatHistory = await response.json();
                setChats(data.chats || []);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch chat history');
                setChats([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, [user, userLoading]);    useEffect(() => {
        fetchChatHistory();
    }, [user, userLoading, fetchChatHistory]);

    useEffect(() => {
        const handleUserChange = (event: CustomEvent) => {
            setTimeout(fetchChatHistory, 50);
        };

        const handleChatCompleted = (event: CustomEvent) => {
            setTimeout(fetchChatHistory, 50);
        };

        const handleVisibilityChanged = (event: CustomEvent) => {
            setTimeout(fetchChatHistory, 50);
        };

        window.addEventListener('userChanged', handleUserChange as EventListener);
        window.addEventListener('chatCompleted', handleChatCompleted as EventListener);
        window.addEventListener('chatVisibilityChanged', handleVisibilityChanged as EventListener);
        
        return () => {
            window.removeEventListener('userChanged', handleUserChange as EventListener);
            window.removeEventListener('chatCompleted', handleChatCompleted as EventListener);
            window.removeEventListener('chatVisibilityChanged', handleVisibilityChanged as EventListener);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [fetchChatHistory]);

    const handleDelete = async () => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== deleteId));

        const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
            method: 'DELETE',
        });

        toast.promise(deletePromise, {
            loading: 'Deleting chat...',
            success: async (response) => {
                if (response.ok) {
                    return 'Chat deleted successfully';
                } else {
                    fetchChatHistory();
                    throw new Error('Failed to delete chat');
                }
            },
            error: (error) => {
                fetchChatHistory();
                return 'Failed to delete chat';
            },
        });

        setShowDeleteDialog(false);

        try {
            const response = await deletePromise;
            if (response.ok && deleteId === id) {
                router.push('/');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const groupedChats = groupChatsByDate(chats);
    const hasEmptyChatHistory = chats.length === 0;
    const isGuestUser = user && (user.email === 'guest@example.com' || user.id?.startsWith('guest-'));

    if (!user) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Login to save and revisit previous chats!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (isGuestUser) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Guest users don&apos;t have chat history. Create an account to save your conversations!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (isLoading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                    Today
                </div>
                <SidebarGroupContent>
                    <div className="flex flex-col">
                        {[44, 32, 28, 64, 52].map((item) => (
                            <div
                                key={item}
                                className="rounded-md h-8 flex gap-2 px-2 items-center"
                            >
                                <div
                                    className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                                    style={
                                        {
                                            '--skeleton-width': `${item}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (error) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="px-2 text-red-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Error loading chats: {error}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (hasEmptyChatHistory) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Your conversations will appear here once you start chatting!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <div className="flex flex-col gap-6">
                            {groupedChats.today.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Today
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {groupedChats.today.map((chat) => (
                                            <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === id}
                                                onDelete={(chatId) => {
                                                    setDeleteId(chatId);
                                                    setShowDeleteDialog(true);
                                                }}
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedChats.yesterday.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Yesterday
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {groupedChats.yesterday.map((chat) => (
                                            <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === id}
                                                onDelete={(chatId) => {
                                                    setDeleteId(chatId);
                                                    setShowDeleteDialog(true);
                                                }}
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedChats.lastWeek.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Last 7 days
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {groupedChats.lastWeek.map((chat) => (
                                            <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === id}
                                                onDelete={(chatId) => {
                                                    setDeleteId(chatId);
                                                    setShowDeleteDialog(true);
                                                }}
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedChats.lastMonth.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Last 30 days
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {groupedChats.lastMonth.map((chat) => (
                                            <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === id}
                                                onDelete={(chatId) => {
                                                    setDeleteId(chatId);
                                                    setShowDeleteDialog(true);
                                                }}
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedChats.older.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Older
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {groupedChats.older.map((chat) => (
                                            <ChatItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={chat.id === id}
                                                onDelete={(chatId) => {
                                                    setDeleteId(chatId);
                                                    setShowDeleteDialog(true);
                                                }}
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            chat and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleDelete} className='bg-red-500 text-white hover:bg-red-600'>
                            Delete
                        </AlertDialogAction>
                        <AlertDialogCancel className='bg-gray-200 text-gray-800 hover:bg-gray-300'>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
