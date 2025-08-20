import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { 
  type RequestHints, 
  systemPrompt, 
  regularPrompt, 
  artifactsPrompt, 
  getRequestPromptFromHints 
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from '@/lib/schemas/chat';
import { geolocation } from '@vercel/functions';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    
    let userType: UserType;
    let userId: string;
    let userEmail: string | undefined;

    if (!session?.user) {
      
      userType = 'guest';
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0] : 
                 request.headers.get('x-real-ip') || 
                 'anonymous';
      
      
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(`guest_${ip}`).digest('hex');
      userId = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-8${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
      userEmail = `guest-${ip}@localhost`;
    } else {
      
      userType = session.user.type;
      userId = session.user.id;
      userEmail = session.user.email ?? undefined;
    }

    const messageCount = await getMessageCountByUserId({
      id: userId,
      differenceInHours: 24,
    });

    if (messageCount >= entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: userId,
        title,
        visibility: selectedVisibilityType,
        userEmail: userEmail,
      });
    } else {
      if (chat.userId !== userId) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

   
    const { longitude, latitude, city, country } = {
      longitude: '0',
      latitude: '0', 
      city: 'Unknown',
      country: 'Unknown'
    };

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const model = myProvider.languageModel(selectedChatModel);
        
        const cleanedMessages = uiMessages.filter(message => {
          if (message.role === 'assistant' && message.parts) {
            return !message.parts.some(part => 
              part.type?.startsWith('tool-') && 
              (part as any).state === 'input-streaming'
            );
          }
          return true;
        });
        
        const allModelMessages = convertToModelMessages(cleanedMessages);
        
       
        const maxMessages = 6;
        const modelMessages = allModelMessages.length > maxMessages 
          ? allModelMessages.slice(-maxMessages) 
          : allModelMessages;
        
       
        if (!modelMessages || modelMessages.length === 0) {
          throw new Error('No valid messages to send to model');
        }
        
        
        const toolsConfig = {
          createDocument: createDocument({ session: session!, dataStream }),
          updateDocument: updateDocument({ session: session!, dataStream }),
        };
        
        const systemPrompt = `${regularPrompt}\n\n${artifactsPrompt}\n\n${getRequestPromptFromHints(requestHints)}`;
        
        const result = streamText({
          model: model,
          messages: modelMessages,
          system: systemPrompt,
          tools: toolsConfig,
          toolChoice: 'auto',
          temperature: 0.7,
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: (error: any) => {
        console.error('🚨 ERROR in streamText:', error);
        return 'Oops, an error occurred: ' + (error?.message || 'Unknown error');
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json({ id: deletedChat.id }, { status: 200 });
}
