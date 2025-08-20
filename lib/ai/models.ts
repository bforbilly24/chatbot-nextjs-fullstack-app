export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  supportsImages?: boolean;
  supportsFiles?: string[]; 
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Llama 3.1 8B Instant',
    description: 'Fast and efficient model via Groq (Free) - Text only',
    supportsImages: false, 
    supportsFiles: [], 
  },
  {
    id: 'chat-model-reasoning',
    name: 'Llama 3.1 8B (Reasoning)',
    description: 'Fast model with reasoning capabilities (Free) - Text only',
    supportsImages: false, 
    supportsFiles: [], 
  },
];


export function getModelById(id: string): ChatModel | undefined {
  return chatModels.find(model => model.id === id);
}

export function modelSupportsImages(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.supportsImages ?? false;
}

export function modelSupportsFileType(modelId: string, mimeType: string): boolean {
  const model = getModelById(modelId);
  return model?.supportsFiles?.includes(mimeType) ?? false;
}

export function getModelFileSupport(modelId: string): string[] {
  const model = getModelById(modelId);
  return model?.supportsFiles ?? [];
}
