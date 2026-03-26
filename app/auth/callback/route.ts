import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Determine redirect based on user metadata
      const isAdmin = data.user.user_metadata?.is_admin;
      const redirectPath = isAdmin ? '/admin/dashboard' : '/join';

      // Redirect to the appropriate dashboard
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Return to login page if there was an error
  return NextResponse.redirect(`${origin}/`);
}
