import { createBrowserClient } from '@supabase/ssr'

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  const isValid = supabaseUrl && 
                  supabaseAnonKey && 
                  supabaseUrl !== 'your_supabase_project_url' && 
                  supabaseAnonKey !== 'your_supabase_anon_key' &&
                  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

  return {
    isValid: !!isValid,
    url: isValid ? supabaseUrl : 'https://supabase.co',
    key: isValid ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  }
}

export function createClient() {
  const config = getSupabaseConfig()
  
  // Only create client if we have valid config, otherwise use a safe fallback
  if (!config.isValid) {
    // Return a client with a valid URL format that won't cause validation errors
    // This allows the app to load but auth won't work (which is expected)
    return createBrowserClient(
      'https://supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
  }
  
  try {
    return createBrowserClient(config.url, config.key)
  } catch (error) {
    // Fallback if client creation fails
    console.warn('Supabase client creation issue:', error)
    return createBrowserClient(
      'https://supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
  }
}
