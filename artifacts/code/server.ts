import { streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { textStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: codePrompt,
      prompt: title,
    });

    for await (const delta of textStream) {
      draftContent += delta;
      
      dataStream.write({
        type: 'data-codeDelta',
        data: delta,
        transient: true,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { textStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'code'),
      prompt: description,
    });

    for await (const delta of textStream) {
      draftContent += delta;
      
      dataStream.write({
        type: 'data-codeDelta',
        data: delta,
        transient: true,
      });
    }

    return draftContent;
  },
});
