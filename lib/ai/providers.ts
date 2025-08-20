import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': groq('llama-3.1-8b-instant'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('llama-3.1-8b-instant'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': groq('llama-3.1-8b-instant'),
        'artifact-model': groq('llama-3.1-8b-instant'),
      },
    });
