import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';
import { SessionWrapper } from '@/components/session-wrapper';

export const metadata: Metadata = {
    metadataBase: new URL('https://chat.vercel.ai'),
    title: {
        default: 'AI Chatbot - Intelligent Conversations Powered by AI',
        template: '%s | AI Chatbot'
    },
    description: 'Experience intelligent conversations with our advanced AI chatbot. Get instant responses, creative assistance, and helpful information in a beautiful, user-friendly interface.',
    keywords: ['AI chatbot', 'artificial intelligence', 'conversation', 'chat assistant', 'AI assistant', 'machine learning'],
    authors: [{ name: 'Halim Putra' }],
    creator: 'Halim Putra',
    publisher: 'Halim Putra',
    applicationName: 'AI Chatbot',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    icons: {
        icon: [
            { url: '/favicon/favicon.ico', sizes: 'any' },
            { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        other: [
            {
                rel: 'mask-icon',
                url: '/favicon/favicon.svg',
                color: '#000000',
            },
        ],
    },
    manifest: '/favicon/site.webmanifest',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://chat.vercel.ai',
        title: 'AI Chatbot - Intelligent Conversations Powered by AI',
        description: 'Experience intelligent conversations with our advanced AI chatbot. Get instant responses, creative assistance, and helpful information.',
        siteName: 'AI Chatbot',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'AI Chatbot Interface',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Chatbot - Intelligent Conversations Powered by AI',
        description: 'Experience intelligent conversations with our advanced AI chatbot. Get instant responses and creative assistance.',
        images: ['/twitter-image.png'],
        creator: '@bforbilly24',
    },
    verification: {
        google: 'your-google-verification-code',
    },
    alternates: {
        canonical: 'https://chat.vercel.ai',
    },
};

export const viewport = {
    maximumScale: 1,
};

const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geist.variable} ${geistMono.variable}`}
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: THEME_COLOR_SCRIPT,
                    }}
                />
            </head>
            <body className="antialiased">
                <ThemeProvider>
                    <Toaster position="top-center" />
                    <SessionWrapper>
                        {children}
                    </SessionWrapper>
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
