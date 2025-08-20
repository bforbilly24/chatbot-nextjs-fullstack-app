'use client';

import { useState } from 'react';
import { Palette, UserCog } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/sidebar-nav';
import { ProfileForm } from '@/components/profile-form';
import { AppearanceForm } from '@/components/appearance-form';
import type { User } from 'next-auth';

const sidebarNavItems = [
    {
        title: 'Profile',
        href: '/settings',
        icon: <UserCog size={18} />,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: <Palette size={18} />,
    },
];

interface AccountSettingsDialogProps {
    children: React.ReactNode;
    user: User;
}

export function AccountSettingsDialog({ children, user }: AccountSettingsDialogProps) {
    const [activeSection, setActiveSection] = useState('/settings');

    const renderContent = () => {
        switch (activeSection) {
            case '/settings':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Profile</h3>
                            <p className="text-sm text-muted-foreground">
                                This is how others will see you on the site.
                            </p>
                        </div>
                        <Separator />
                        <ProfileForm
                            defaultValues={{
                                name: user?.name || '',
                                email: user?.email || '',
                            }}
                        />
                    </div>
                );
            case '/settings/appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Appearance</h3>
                            <p className="text-sm text-muted-foreground">
                                Customize the appearance of the app. Automatically switch between day
                                and night themes.
                            </p>
                        </div>
                        <Separator />
                        <AppearanceForm />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 flex-col space-y-4 overflow-hidden lg:flex-row lg:space-y-0 lg:space-x-6">
                    <aside className="lg:w-1/4">
                        <SidebarNav
                            items={sidebarNavItems}
                            onItemClick={setActiveSection}
                            activeItem={activeSection}
                        />
                    </aside>
                    <div className="flex-1 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
