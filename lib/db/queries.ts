import 'server-only';

import { prisma } from './prisma';
import type { 
  User, 
  Chat, 
  Message as DBMessage, 
  Document, 
  Suggestion, 
  Vote,
  Visibility 
} from '../generated/prisma';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import { ChatSDKError } from '../errors';
import { guestRegex } from '../constants';
import type { ArtifactKind } from '@/components/artifact';
import type { VisibilityType } from '@/components/visibility-selector';

export async function getUser(email: string): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: email,
      },
    });
    return users;
  } catch (error) {
    console.error('Failed to get user from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function createUser(email: string, password: string): Promise<User> {
  const hashedPassword = await generateHashedPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        id: generateUUID(),
        email,
        password: hashedPassword,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to create user in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function createGuestUser(): Promise<User[]> {
  const email = `guest-${Date.now()}`;
  const password = await generateHashedPassword(generateUUID());

  try {
    const user = await prisma.user.create({
      data: {
        id: generateUUID(),
        email,
        password,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    
    return [user];
  } catch (error) {
    console.error('Failed to create guest user in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function recreateGuestUserById({
  id,
  email
}: {
  id: string;
  email: string;
}): Promise<User> {
  const password = await generateHashedPassword(generateUUID());

  try {
    const user = await prisma.user.create({
      data: {
        id, 
        email,
        password,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to recreate guest user in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function createGoogleUser({ 
  email
}: { 
  email: string; 
}): Promise<User> {
  try {
    const user = await prisma.user.create({
      data: {
        id: generateUUID(),
        email,
        
        password: null,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to create Google user in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function saveChat({
  id,
  title,
  userId,
  visibility = 'private',
  userEmail,
}: {
  id: string;
  title: string;
  userId: string;
  visibility?: VisibilityType;
  userEmail?: string;
}): Promise<Chat> {
  try {
    
    let userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!userExists && userEmail && guestRegex.test(userEmail)) {
      userExists = await recreateGuestUserById({
        id: userId,
        email: userEmail
      });
    }
    
    if (!userExists && userEmail) {
      userExists = await recreateGuestUserById({
        id: userId,
        email: userEmail.includes('guest-') ? userEmail : `guest-${Date.now()}`
      });
    }
    
    if (!userExists) {
      const guestEmail = `guest-${Date.now()}`;
      userExists = await recreateGuestUserById({
        id: userId,
        email: guestEmail
      });
    }

    const chat = await prisma.chat.create({
      data: {
        id,
        title,
        userId,
        visibility: visibility as Visibility,
        createdAt: new Date(),
      },
    });
    return chat;
  } catch (error) {
    console.error('Failed to save chat in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const deletedChat = await prisma.chat.delete({
      where: {
        id,
      },
    });
    return deletedChat;
  } catch (error) {
    console.error('Failed to delete chat from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getChatsByUserId({ 
  id,
  limit,
  startingAfter,
  endingBefore,
}: { 
  id: string;
  limit?: number;
  startingAfter?: string | null;
  endingBefore?: string | null;
}): Promise<{ chats: Chat[]; hasMore: boolean } | Chat[]> {
  try {
    
    if (limit === undefined && !startingAfter && !endingBefore) {
      const chats = await prisma.chat.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return chats;
    }

    const extendedLimit = (limit || 10) + 1;
    let whereCondition: any = { userId: id };

    if (startingAfter) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: startingAfter },
      });

      if (!selectedChat) {
        throw new ChatSDKError('bad_request:database');
      }

      whereCondition = {
        ...whereCondition,
        createdAt: {
          gt: selectedChat.createdAt,
        },
      };
    } else if (endingBefore) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: endingBefore },
      });

      if (!selectedChat) {
        throw new ChatSDKError('bad_request:database');
      }

      whereCondition = {
        ...whereCondition,
        createdAt: {
          lt: selectedChat.createdAt,
        },
      };
    }

    const filteredChats = await prisma.chat.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      take: extendedLimit,
    });

    const hasMore = filteredChats.length > (limit || 10);

    return {
      chats: hasMore ? filteredChats.slice(0, limit || 10) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getChatById({ id }: { id: string }): Promise<Chat | null> {
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id,
      },
    });
    return chat;
  } catch (error) {
    console.error('Failed to get chat from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function saveMessages({ messages }: { messages: Array<any> }) {
  try {
    await prisma.message.createMany({
      data: messages.map((message) => ({
        ...message,
        id: generateUUID(),
        createdAt: new Date(),
      })),
    });
  } catch (error) {
    console.error('Failed to save messages in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getMessagesByChatId({ id }: { id: string }): Promise<DBMessage[]> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return messages;
  } catch (error) {
    console.error('Failed to get messages from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const existingVote = await prisma.vote.findUnique({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        },
      },
    });

    if (existingVote) {
      await prisma.vote.update({
        where: {
          chatId_messageId: {
            chatId,
            messageId,
          },
        },
        data: {
          isUpvoted: type === 'up',
        },
      });
    } else {
      await prisma.vote.create({
        data: {
          chatId,
          messageId,
          isUpvoted: type === 'up',
        },
      });
    }
  } catch (error) {
    console.error('Failed to vote message in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getVotesByChatId({ id }: { id: string }): Promise<Vote[]> {
  try {
    const votes = await prisma.vote.findMany({
      where: {
        chatId: id,
      },
    });
    return votes;
  } catch (error) {
    console.error('Failed to get votes from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function saveDocument({
  id,
  title,
  content,
  kind,
  userId,
}: {
  id: string;
  title: string;
  content?: string;
  kind: ArtifactKind;
  userId: string;
}): Promise<Document> {
  try {
    const document = await prisma.document.create({
      data: {
        id,
        title,
        content,
        kind: kind as any,
        userId,
        createdAt: new Date(),
      },
    });
    return document;
  } catch (error) {
    console.error('Failed to save document in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getDocumentsById({
  id,
}: {
  id: string;
}): Promise<Document[]> {
  try {
    const documents = await prisma.document.findMany({
      where: {
        id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return documents;
  } catch (error) {
    console.error('Failed to get documents from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getDocumentById({
  id,
}: {
  id: string;
}): Promise<Document | null> {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return document;
  } catch (error) {
    console.error('Failed to get document from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getDocumentByIdAndCreatedAt({
  id,
  createdAt,
}: {
  id: string;
  createdAt: Date;
}): Promise<Document | null> {
  try {
    const document = await prisma.document.findUnique({
      where: {
        id_createdAt: {
          id,
          createdAt,
        },
      },
    });
    return document;
  } catch (error) {
    console.error('Failed to get document from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await prisma.document.deleteMany({
      where: {
        id,
        createdAt: {
          gt: timestamp,
        },
      },
    });
  } catch (error) {
    console.error('Failed to delete documents from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{
    id: string;
    documentId: string;
    documentCreatedAt: Date;
    originalText: string;
    suggestedText: string;
    description?: string;
    userId: string;
  }>;
}) {
  try {
    await prisma.suggestion.createMany({
      data: suggestions.map((suggestion) => ({
        ...suggestion,
        createdAt: new Date(),
      })),
    });
  } catch (error) {
    console.error('Failed to save suggestions in database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}): Promise<Suggestion[]> {
  try {
    const suggestions = await prisma.suggestion.findMany({
      where: {
        documentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return suggestions;
  } catch (error) {
    console.error('Failed to get suggestions from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getMessageById({ id }: { id: string }): Promise<DBMessage[]> {
  try {
    const message = await prisma.message.findUnique({
      where: {
        id,
      },
    });
    
    return message ? [message] : [];
  } catch (error) {
    console.error('Failed to get message by id:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    await prisma.message.deleteMany({
      where: {
        chatId,
        createdAt: {
          gte: timestamp,
        },
      },
    });
  } catch (error) {
    console.error('Failed to delete messages from database:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        visibility: visibility as Visibility,
      },
    });
  } catch (error) {
    console.error('Failed to update chat visibility:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

export async function getMessageCountByUserId({ 
  id, 
  differenceInHours 
}: { 
  id: string; 
  differenceInHours: number; 
}): Promise<number> {
  try {
    const timeAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const count = await prisma.message.count({
      where: {
        chat: {
          userId: id,
        },
        createdAt: {
          gte: timeAgo,
        },
        role: 'user',
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to get message count by user id:', error);
    throw new ChatSDKError('bad_request:database');
  }
}

