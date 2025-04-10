import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createAzure } from '@ai-sdk/azure';

const azure = createAzure({
  resourceName: process.env["AZURE_RESOURCE_NAME"], // Azure resource name
  apiKey: process.env["AZURE_OPENAI_API_KEY"],
});

const azure_image = createAzure({
  resourceName: process.env["AZURE_RESOURCE_NAME_IMAGE"], // Azure resource name
  apiKey: process.env["AZURE_OPENAI_API_KEY_IMAGE"],
});

export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

// export const myProvider = customProvider({
//   languageModels: {
//     'chat-model-small': openai('gpt-4o-mini'),
//     'chat-model-large': openai('gpt-4o'),
//     'chat-model-reasoning': wrapLanguageModel({
//       model: fireworks('accounts/fireworks/models/deepseek-r1'),
//       middleware: extractReasoningMiddleware({ tagName: 'think' }),
//     }),
//     'title-model': openai('gpt-4-turbo'),
//     'artifact-model': openai('gpt-4o-mini'),
//   },
//   imageModels: {
//     'small-model': openai.image('dall-e-2'),
//     'large-model': openai.image('dall-e-3'),
//   },
// });

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': azure('gpt-4o-mini'),
    'large-model': azure('gpt-4o', ),
    'chat-model-reasoning': wrapLanguageModel({
      model: fireworks('accounts/fireworks/models/deepseek-r1'),
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
