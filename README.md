# Real Estate Social Magic

A Next.js application that transforms property descriptions into engaging social media content using OpenAI's GPT-4o.

## Features

- Modern, clean, and mobile-friendly UI with a soft blue and white color palette
- Google authentication via Supabase
- Large text area for property descriptions
- Conditional Generate button (requires login)
- AI-powered content generation for:
  - Instagram (with emojis)
  - LinkedIn (professional)
  - Facebook (community-focused)
  - X/Twitter (short and punchy)
  - TikTok (script format)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a project at [https://app.supabase.com](https://app.supabase.com)
   - Enable Google authentication in Authentication > Providers
   - Add your site URL to the allowed redirect URLs: `http://localhost:3000/auth/callback`
   - Get your project URL and anon key from Settings > API

3. Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- Supabase (Authentication)