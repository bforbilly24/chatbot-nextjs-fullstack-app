'use client';

import { EllipsisVertical, CircleUser, MessageSquareDot, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSessionStore } from '@/lib/stores';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { guestRegex } from '@/lib/constants';
import { AccountSettingsDialog } from '@/components/account-settings-dialog';

export function NavUser() {
    const router = useRouter();
    const { isMobile } = useSidebar();
    const { user } = useSessionStore();

    if (!user) return null;

    const isGuest = guestRegex.test(user?.email ?? '');
    const userName = isGuest ? 'Guest' : user?.name || user?.email || 'User';
    const userEmail = isGuest ? 'Guest User' : user?.email || '';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8">
                                <AvatarImage
                                    src={`https://avatar.vercel.sh/${userEmail}`}
                                    alt={userName}
                                />
                                <AvatarFallback className="text-xs">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userName}</span>
                                <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
                            </div>
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-8">
                                    <AvatarImage
                                        src={`https://avatar.vercel.sh/${userEmail}`}
                                        alt={userName}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{userName}</span>
                                    <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {!isGuest && (
                                <>
                                    <AccountSettingsDialog user={user}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <CircleUser />
                                            Account
                                        </DropdownMenuItem>
                                    </AccountSettingsDialog>
                                </>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            if (isGuest) {
                                router.push('/v1/login');
                            } else {
                                signOut({
                                    redirectTo: '/',
                                });
                            }
                        }}>
                            <LogOut />
                            {isGuest ? 'Login' : 'Log out'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
