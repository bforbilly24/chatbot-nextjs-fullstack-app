import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { Editor } from '@/components/text-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
  EyeIcon,
  PencilEditIcon,
} from '@/components/icons';
import type { Suggestion } from '@/lib/generated/prisma';
import { toast } from 'sonner';
import { useState } from 'react';

interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

const TextArtifactContent = ({
  mode,
  status,
  content,
  isCurrentVersion,
  currentVersionIndex,
  onSaveContent,
  getDocumentContentById,
  isLoading,
  metadata,
}: any) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (isLoading) {
    return <DocumentSkeleton artifactKind="text" />;
  }

  if (mode === 'diff') {
    const oldContent = getDocumentContentById(currentVersionIndex - 1);
    const newContent = getDocumentContentById(currentVersionIndex);

    return <DiffView oldContent={oldContent} newContent={newContent} />;
  }

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsPreviewMode(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            !isPreviewMode
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <PencilEditIcon size={14} />
          Edit
        </button>
        <button
          onClick={() => setIsPreviewMode(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isPreviewMode
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <EyeIcon size={14} />
          Preview
        </button>
      </div>

      <div className="flex flex-row py-8 md:p-20 px-4">
        {isPreviewMode ? (
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer>{content}</MarkdownRenderer>
          </div>
        ) : (
          <Editor
            content={content}
            suggestions={metadata ? metadata.suggestions : []}
            isCurrentVersion={isCurrentVersion}
            currentVersionIndex={currentVersionIndex}
            status={status}
            onSaveContent={onSaveContent}
          />
        )}

        {metadata?.suggestions && metadata.suggestions.length > 0 ? (
          <div className="md:hidden h-dvh w-12 shrink-0" />
        ) : null}
      </div>
    </>
  );
};

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
  kind: 'text',
  description: 'Useful for text content, like drafting essays and emails.',
  initialize: async ({ documentId, setMetadata }) => {
    setMetadata({
      suggestions: [],
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'data-suggestion') {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === 'data-textDelta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: (props) => <TextArtifactContent {...props} />,
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex, setMetadata }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: 'Add final polish',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.',
            },
          ],
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: 'Request suggestions',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please add suggestions you have that could improve the writing.',
            },
          ],
        });
      },
    },
  ],
});
