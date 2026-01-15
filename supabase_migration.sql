-- Create user_credits table in Supabase (email-based, no login required)
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_credits_email_idx ON user_credits(email);

-- Disable Row Level Security (public table for email-based access)
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;

-- Note: Since we're using email-based tracking without authentication,
-- we don't need RLS policies. The API will handle access control.
