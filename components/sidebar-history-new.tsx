'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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
    
    // Simple state management without SWR
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch chat history function
    const fetchChatHistory = useCallback(async () => {
        if (!user || userLoading) {
            setChats([]);
            return;
        }

        console.log('SidebarHistory: Fetching chat history for user:', user.id);
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/history?limit=100');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            
            const data: ChatHistory = await response.json();
            console.log('SidebarHistory: Fetched', data.chats.length, 'chats');
            setChats(data.chats || []);
        } catch (err) {
            console.error('SidebarHistory: Error fetching chats:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch chats');
            setChats([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, userLoading]);

    // Fetch on user change
    useEffect(() => {
        console.log('SidebarHistory: User effect triggered - user:', !!user, 'userLoading:', userLoading);
        fetchChatHistory();
    }, [user, userLoading, fetchChatHistory]);

    // Listen for user change events from session
    useEffect(() => {
        const handleUserChange = () => {
            console.log('SidebarHistory: User changed event received, refetching...');
            fetchChatHistory();
        };

        window.addEventListener('userChanged', handleUserChange);
        
        return () => {
            window.removeEventListener('userChanged', handleUserChange);
        };
    }, [fetchChatHistory]);

    const handleDelete = async () => {
        // Optimistically remove from local state
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
                    // Revert optimistic update on failure
                    fetchChatHistory();
                    throw new Error('Failed to delete chat');
                }
            },
            error: (error) => {
                console.error('Delete error:', error);
                // Revert optimistic update on error
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

    // Group chats for rendering
    const groupedChats = groupChatsByDate(chats);
    const hasEmptyChatHistory = chats.length === 0;

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

    console.log('SidebarHistory: Rendering', chats.length, 'chats');

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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
