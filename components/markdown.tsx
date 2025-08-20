import Link from 'next/link';
import React, { memo, useEffect, useState, Children } from 'react';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { codeToHtml } from 'shiki';

type Components = StreamdownProps['components'];

const CodeBlock = ({ children, className, ...props }: any) => {
    const [highlightedCode, setHighlightedCode] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const language = className?.replace('language-', '') || 'text';
    const codeContent = String(children).replace(/\n$/, '');

    useEffect(() => {
        const highlightCode = async () => {
            try {
                const html = await codeToHtml(codeContent, {
                    lang: language === 'text' ? 'txt' : language,
                    theme: 'github-dark'
                });
                setHighlightedCode(html);
            } catch (error) {
                setHighlightedCode(`<code>${codeContent}</code>`);
            }
        };

        highlightCode();
    }, [codeContent, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <div
                className="bg-gray-900 rounded-lg p-4 overflow-x-auto border"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                title={copied ? "Copied!" : "Copy code"}
            >
                {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                )}
            </button>
        </div>
    );
};

const components: Partial<Components> = {
    a: ({ node, children, ...props }) => {
        return (
            <Link
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noreferrer"
                href={props.href || ''}
                {...props}
            >
                {children}
            </Link>
        );
    },
    pre: ({ children, ...props }) => {
        const codeElement = Children.toArray(children).find(
            (child: any) => child.type === 'code'
        ) as any;

        if (codeElement) {
            return <CodeBlock {...codeElement.props} />;
        }

        return (
            <pre
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto border"
                {...props}
            >
                {children}
            </pre>
        );
    },
    code: ({ children, className, ...props }) => {
        const isInlineCode = !className;
        if (isInlineCode) {
            return (
                <code
                    className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                    {...props}
                >
                    {children}
                </code>
            );
        }

        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => (
    <Streamdown components={components}>{children}</Streamdown>
);

export const Markdown = memo(
    NonMemoizedMarkdown,
    (prevProps, nextProps) => prevProps.children === nextProps.children,
);
