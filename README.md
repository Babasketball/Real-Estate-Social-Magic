# Real Estate Social Magic

A Next.js application that transforms property descriptions into engaging social media content using OpenAI's GPT-4o.

## Features

- Modern, clean, and mobile-friendly UI with a soft blue and white color palette
- Large text area for property descriptions
- Generate button to create social media posts
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

2. Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
