import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const chat = await getChatById({ id });

    if (!chat) {
        return {
            title: 'Chat Not Found - AI Chatbot',
            description: 'The requested chat could not be found.',
        };
    }

    return {
        title: `${chat.title} - AI Chatbot`,
        description: `Continue your conversation: ${chat.title}. Powered by intelligent AI technology.`,
    };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const chat = await getChatById({ id });

    if (!chat) {
        notFound();
    }

    const session = await auth();

    if (!session) {
        redirect('/api/auth/guest');
    }

    if (!session.user) {
        return notFound();
    }

    if (session.user.id !== chat.userId) {
        return notFound();
    }

    const messagesFromDb = await getMessagesByChatId({
        id,
    });

    const uiMessages = convertToUIMessages(messagesFromDb);

    const cookieStore = await cookies();
    const chatModelFromCookie = cookieStore.get('chat-model');

    if (!chatModelFromCookie) {
        return (
            <>
                <Chat
                    id={chat.id}
                    initialMessages={uiMessages}
                    initialChatModel={DEFAULT_CHAT_MODEL}
                    initialVisibilityType={'private' as const}
                    isReadonly={session?.user?.id !== chat.userId}
                    session={session}
                    autoResume={true}
                />
                <DataStreamHandler />
            </>
        );
    }

    return (
        <>
            <Chat
                id={chat.id}
                initialMessages={uiMessages}
                initialChatModel={chatModelFromCookie.value}
                initialVisibilityType={'private' as const}
                isReadonly={session?.user?.id !== chat.userId}
                session={session}
                autoResume={true}
            />
            <DataStreamHandler />
        </>
    );
}
