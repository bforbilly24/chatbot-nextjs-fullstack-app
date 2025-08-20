'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/generated/prisma';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { AnimatedMultimodalInput } from './animated-multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector, useArtifact } from '@/hooks/use-artifact';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { ModelCapabilities } from './model-capabilities';
import { useDataStream } from './data-stream-provider';
import { RateLimitPrompt } from './rate-limit-prompt';

export function Chat({
    id,
    initialMessages,
    initialChatModel,
    initialVisibilityType,
    isReadonly,
    session,
    autoResume,
}: {
    id: string;
    initialMessages: ChatMessage[];
    initialChatModel: string;
    initialVisibilityType: VisibilityType;
    isReadonly: boolean;
    session: Session | null;
    autoResume: boolean;
}) {
    const { visibilityType } = useChatVisibility({
        chatId: id,
        initialVisibilityType,
    });

    const { setDataStream } = useDataStream();

    const [input, setInput] = useState<string>('');
    const [showRateLimitPrompt, setShowRateLimitPrompt] = useState(false);

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        stop,
        regenerate,
        resumeStream,
    } = useChat<ChatMessage>({
        id,
        messages: initialMessages,
        experimental_throttle: 100,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: '/api/chat',
            fetch: fetchWithErrorHandlers,
            prepareSendMessagesRequest({ messages, id, body }) {
                return {
                    body: {
                        id,
                        message: messages.at(-1),
                        selectedChatModel: initialChatModel,
                        selectedVisibilityType: visibilityType,
                        ...body,
                    },
                };
            },
        }),
        onData: (dataPart) => {
            setDataStream((ds) => (ds ? [...ds, dataPart] : []));
        },
        onFinish: () => {
            window.dispatchEvent(new CustomEvent('chatCompleted', { detail: { chatId: id } }));
        },
        onError: (error) => {
            if (error instanceof ChatSDKError) {
                if (error.type === 'rate_limit' && error.surface === 'chat') {
                    setShowRateLimitPrompt(true);
                } else {
                    toast({
                        type: 'error',
                        description: error.message,
                    });
                }
            }
        },
    });

    const searchParams = useSearchParams();
    const query = searchParams.get('query');

    const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

    useEffect(() => {
        if (query && !hasAppendedQuery) {
            sendMessage({
                role: 'user' as const,
                parts: [{ type: 'text', text: query }],
            });

            setHasAppendedQuery(true);
            window.history.replaceState({}, '', `/chat/${id}`);
        }
    }, [query, sendMessage, hasAppendedQuery, id]);

    const { data: votes } = useSWR<Array<Vote>>(
        messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
        fetcher,
    );

    const [attachments, setAttachments] = useState<Array<Attachment>>([]);
    const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
    const { setArtifact } = useArtifact();

    useEffect(() => {
        setArtifact((prev) => ({
            ...prev,
            isVisible: false,
            documentId: 'init',
            content: '',
            title: '',
            status: 'idle',
        }));
    }, [id, setArtifact]);

    useAutoResume({
        autoResume,
        initialMessages,
        resumeStream,
        setMessages,
    });

    return (
        <>
            <div className="flex flex-col min-w-0 h-dvh bg-background">
                <ChatHeader
                    chatId={id}
                    selectedModelId={initialChatModel}
                    selectedVisibilityType={initialVisibilityType}
                    isReadonly={isReadonly}
                    session={session}
                />

                <Messages
                    chatId={id}
                    status={status}
                    votes={votes}
                    messages={messages}
                    setMessages={setMessages}
                    regenerate={regenerate}
                    isReadonly={isReadonly}
                    isArtifactVisible={isArtifactVisible}
                    user={session?.user}
                />

                <ModelCapabilities modelId="chat-model" className="mx-auto px-4 pb-2 w-full md:max-w-3xl" />

                <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                    {!isReadonly && (
                        <AnimatedMultimodalInput
                            chatId={id}
                            input={input}
                            setInput={setInput}
                            status={status}
                            stop={stop}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            messages={messages}
                            setMessages={setMessages}
                            sendMessage={sendMessage}
                            selectedVisibilityType={visibilityType}
                        />
                    )}
                </form>
            </div>

            <Artifact
                chatId={id}
                input={input}
                setInput={setInput}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                sendMessage={sendMessage}
                messages={messages}
                setMessages={setMessages}
                regenerate={regenerate}
                votes={votes}
                isReadonly={isReadonly}
                selectedVisibilityType={visibilityType}
            />

            <RateLimitPrompt
                isOpen={showRateLimitPrompt}
                onOpenChange={setShowRateLimitPrompt}
            />
        </>
    );
}
