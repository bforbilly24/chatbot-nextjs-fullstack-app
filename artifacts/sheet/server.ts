import { myProvider } from '@/lib/ai/providers';
import { sheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamText } from 'ai';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { textStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: sheetPrompt,
      prompt: title,
    });

    for await (const delta of textStream) {
      draftContent += delta;
      
      dataStream.write({
        type: 'data-sheetDelta',
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
      system: updateDocumentPrompt(document.content, 'sheet'),
      prompt: description,
    });

    for await (const delta of textStream) {
      draftContent += delta;
      
      dataStream.write({
        type: 'data-sheetDelta',
        data: delta,
        transient: true,
      });
    }

    return draftContent;
  },
});
