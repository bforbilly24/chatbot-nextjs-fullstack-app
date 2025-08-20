# AI Chatbot - Next.js Full-Stack Application

![Image](https://github.com/user-attachments/assets/dd3d4fd5-c750-44fe-876a-5deaa8fe9aeb)

A modern, intelligent AI chatbot application built with Next.js, featuring persistent chat history, multiple AI model providers, and a beautiful user interface. Perfect for developers looking to build sophisticated conversational AI applications with authentication, database integration, and artifact generation capabilities.

Developers need powerful tools to build conversational AI applications that can compete in today's market.

As a developer building AI applications, I need to deliver feature-rich chatbot experiences that users love. So often there are basic chat interfaces that lack the polish and functionality that modern users expect. It's competitive.

Even with solid AI integration, a weak user experience and limited features can still hurt adoption...

... and that's why I built this comprehensive AI Chatbot template!

This template contains a full-stack AI chatbot built with Next.js 15, Prisma, PostgreSQL, and NextAuth.js. You'll find support for multiple AI providers, persistent chat history, artifact generation, and a beautiful shadcn/ui interface.

It's a perfect launch point for building production-ready AI chatbot applications that showcase modern development practices—without compromising on user experience or functionality.

I opted to use the Next.js App Router with React Server Components to provide the best performance and developer experience for building modern AI applications.

## 🚀 Features

- **Modern Stack**: Built with Next.js 15, TypeScript, Prisma, and PostgreSQL
- **AI Integration**: Multiple AI model providers (Groq, OpenAI, Gemini) with unified API
- **Authentication**: Secure OAuth with NextAuth.js and Google authentication
- **Persistent Storage**: Chat history and user data with Prisma and PostgreSQL
- **Beautiful UI**: Modern interface built with shadcn/ui and Tailwind CSS
- **Artifact Generation**: Create and edit code, text, and other artifacts within conversations
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark/Light Theme**: Beautiful theme switching with next-themes
- **Real-time Chat**: Streaming responses with the AI SDK
- **File Upload**: Support for image and document uploads
- **Chat Management**: Save, organize, and search through chat conversations
- **Performance Optimized**: SEO-friendly with optimized fonts and images

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: AI SDK with multiple providers (Groq, OpenAI, Gemini)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animation**: Framer Motion for smooth interactions
- **Typography**: Geist font family (Sans & Mono)
- **State Management**: Zustand for client-side state
- **File Upload**: Vercel Blob for file storage
- **Development**: TypeScript, ESLint, Biome, Playwright

## 📦 Getting Started

### Prerequisites

Make sure you have Node.js 18+ and Bun installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bforbilly24/chatbot-nextjs-fullstack-app.git
cd chatbot-nextjs-fullstack-app
```

2. Install dependencies:
```bash
bun install
# or
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth.js secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GROQ_API_KEY` - Groq API key
- `OPENAI_API_KEY` - OpenAI API key (optional)

4. Set up the database:
```bash
bun run db:generate
bun run db:migrate
```

5. Run the development server:
```bash
bun run dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
chatbot-nextjs-fullstack-app/
├── 📁 app/
│   ├── (auth)/              # Authentication pages
│   │   ├── v1/             # Auth layout and pages
│   │   └── auth.ts         # NextAuth configuration
│   ├── (chat)/             # Chat application pages
│   │   ├── page.tsx        # Main chat interface
│   │   ├── [id]/          # Individual chat pages
│   │   └── layout.tsx      # Chat layout with sidebar
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── 📁 components/
│   ├── ui/                 # shadcn/ui components
│   ├── chat.tsx           # Main chat component
│   ├── app-sidebar.tsx    # Sidebar navigation
│   ├── message.tsx        # Chat message component
│   ├── artifact.tsx       # Artifact display component
│   └── ...                # Other UI components
├── 📁 lib/
│   ├── ai/                # AI SDK configuration
│   ├── db/                # Database utilities
│   ├── schemas/           # Zod validation schemas
│   └── utils.ts           # Utility functions
├── 📁 prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── 📁 public/
│   ├── favicon/           # Favicon and PWA icons
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-96x96.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   ├── site.webmanifest
│   │   ├── web-app-manifest-192x192.png
│   │   └── web-app-manifest-512x512.png
│   └── images/            # Static images
├── 📄 package.json
├── 📄 prisma/schema.prisma
├── 📄 tailwind.config.ts
├── 📄 next.config.ts
└── 📄 tsconfig.json
```

## 🎨 Components

This project includes various pre-built components:

- **Chat Interface**: Real-time streaming chat with message history
- **Authentication**: Secure OAuth login with Google
- **Sidebar Navigation**: Chat history and session management
- **Artifact System**: Generate and edit code, text, and documents
- **Message Components**: Rich message display with markdown support
- **Theme Provider**: Dark/light theme switching
- **File Upload**: Image and document upload support
- **Model Selector**: Switch between different AI models
- **Settings Dialog**: User preferences and account settings

## 🚀 Available Scripts

- `bun run dev` - Start development server with Turbo
- `bun run build` - Build for production with Prisma generation
- `bun run start` - Start production server
- `bun run lint` - Run ESLint and Biome linting
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Format code with Biome
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio
- `bun run test` - Run Playwright tests

## ⚙️ Configuration

### AI Model Providers
- Configure AI models in `lib/ai/models.ts`
- Default provider is Groq with Llama models
- Support for OpenAI, Gemini, and other providers
- Easy to add new providers with the AI SDK

### Database Schema
- User authentication and profile management
- Chat and message persistence
- File upload tracking
- Configurable in `prisma/schema.prisma`

### Authentication
- Google OAuth configured in `app/(auth)/auth.ts`
- Session management with NextAuth.js
- Protected routes and middleware

### Styling
- Tailwind CSS with custom design system
- shadcn/ui component library
- Dark/light theme support
- Responsive design patterns

### PWA Configuration
- Progressive Web App manifest in `public/favicon/site.webmanifest`
- App icons for iOS and Android
- Favicon and touch icons included

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [AI SDK Documentation](https://sdk.vercel.ai/docs) - AI SDK for building conversational interfaces
- [Prisma Documentation](https://www.prisma.io/docs) - Next-generation ORM for TypeScript
- [NextAuth.js](https://authjs.dev) - Authentication for Next.js applications
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components built with Radix UI

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbforbilly24%2Fchatbot-nextjs-fullstack-app)

### Environment Variables for Production

Make sure to set up these environment variables in your deployment:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GROQ_API_KEY` - Groq API key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `NEXTAUTH_URL` - Your production URL

### Other Deployment Options

You can also deploy this application on:
- **Railway**: Automatic deployments with PostgreSQL included
- **Netlify**: Serverless deployment with database providers
- **AWS Amplify**: Full-stack deployment with AWS services
- **DigitalOcean App Platform**: Container-based deployment
- **Supabase**: Deploy with integrated PostgreSQL and authentication

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Halim Putra**

- GitHub: [@bforbilly24](https://github.com/bforbilly24)
- Repository: [chatbot-nextjs-fullstack-app](https://github.com/bforbilly24/chatbot-nextjs-fullstack-app)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/bforbilly24/chatbot-nextjs-fullstack-app/issues).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Show your support

Give a ⭐️ if this project helped you build better AI applications!
