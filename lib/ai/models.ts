import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createAzure } from '@ai-sdk/azure';

const azure = createAzure({
  resourceName: process.env["AZURE_RESOURCE_NAME"], 
  apiKey: process.env["AZURE_OPENAI_API_KEY"],
});

const azure_image = createAzure({
  resourceName: process.env["AZURE_RESOURCE_NAME_IMAGE"], 
  apiKey: process.env["AZURE_OPENAI_API_KEY_IMAGE"],
});

export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': azure('gpt-4o-mini'),
    'large-model': azure('gpt-4o'),
    'chat-model-reasoning': wrapLanguageModel({
      // model: fireworks('accounts/fireworks/models/deepseek-r1'),
      model: azure('gpt-4o'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': azure('gpt-4o'),
    'artifact-model': azure('gpt-4o'),
  },
  imageModels: {
    'small-model': azure_image.imageModel('dall-e-3'),
    'large-model': azure_image.imageModel('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];
