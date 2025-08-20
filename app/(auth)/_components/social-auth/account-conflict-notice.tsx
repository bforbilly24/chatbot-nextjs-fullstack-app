"use client";

import { AlertTriangle } from "lucide-react";

export function AccountConflictNotice() {
    return (
        <div className="border-yellow-200 bg-yellow-50 text-yellow-800 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
                <AlertTriangle className="size-4" />
                <h4 className="font-medium">Account Exists</h4>
            </div>
            <p className="mt-2 text-sm">
                This email is already registered with a password. Please login using your email and password instead of Google.
            </p>
        </div>
    );
}
