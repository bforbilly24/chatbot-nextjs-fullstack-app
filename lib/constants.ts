import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const suggestedActions = [
    {
        title: 'What are the advantages',
        label: 'of using Next.js?',
        action: 'What are the advantages of using Next.js?',
    },
    {
        title: 'Write code to',
        label: `fibonacci's algorithm`,
        action: `Write code to fibonacci algorithm`,
    },
    {
        title: 'Help me write an essay',
        label: `about silicon indonesia`,
        action: `Help me write an essay about indonesia`,
    },
    {
        title: 'Explain the difference',
        label: 'React vs Vue.js',
        action: 'Explain the difference between React vs Vue.js',
    },
];
