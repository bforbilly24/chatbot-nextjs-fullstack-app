'use client';

import { AlertTriangle, FileText, ImageIcon } from 'lucide-react';
import { modelSupportsImages, getModelFileSupport } from '@/lib/ai/models';

interface ModelCapabilitiesProps {
    modelId: string;
    className?: string;
}

export function ModelCapabilities({ modelId, className }: ModelCapabilitiesProps) {
    const supportsImages = modelSupportsImages(modelId);
    const supportedFiles = getModelFileSupport(modelId);

    if (supportsImages || supportedFiles.length > 0) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 ${className}`}>
            <AlertTriangle size={16} />
            <span>Current model doesn&apos;t support file uploads</span>
        </div>
    );
}

export function ModelSupportInfo({ modelId }: { modelId: string }) {
    const supportsImages = modelSupportsImages(modelId);
    const supportedFiles = getModelFileSupport(modelId);

    return (
        <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
                <ImageIcon size={12} />
                <span>Images: {supportsImages ? '✅ Supported' : '❌ Not supported'}</span>
            </div>
            <div className="flex items-center gap-2">
                <FileText size={12} />
                <span>Files: {supportedFiles.length > 0 ? `✅ ${supportedFiles.length} types` : '❌ Not supported'}</span>
            </div>
            {supportedFiles.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    Supported: {supportedFiles.join(', ')}
                </div>
            )}
        </div>
    );
}
