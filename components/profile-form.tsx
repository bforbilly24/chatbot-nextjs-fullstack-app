'use client';

import { profileFormSchema, type ProfileFormValues } from '@/lib/schemas/settings';

interface ProfileFormProps {
    defaultValues?: Partial<ProfileFormValues>;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium">Name</h4>
                    <p className="text-sm text-muted-foreground">{defaultValues?.name || 'Not available'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        This information is provided by your Google account and cannot be changed here.
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">{defaultValues?.email || 'Not available'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        This information is provided by your Google account and cannot be changed here.
                    </p>
                </div>
            </div>
        </div>
    );
}
