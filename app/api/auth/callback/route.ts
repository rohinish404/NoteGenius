import { NextResponse } from 'next/server';
import { createClient } from '@/auth/server';
import { prisma } from '@/db/prisma'; 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError, data: sessionData } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && sessionData.user) {
      const user = sessionData.user;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existingUser) {
          console.log(`Creating new user in local DB: ${user.id}, ${user.email}`);
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
            },
          });
           console.log(`User created successfully: ${user.id}`);
        } else {
            console.log(`User already exists in local DB: ${user.id}`);
        }
      } catch (dbError) {
        console.error('Failed to find or create user in local DB:', dbError);
        return NextResponse.redirect(`${origin}/login?error=db_sync_failed`);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      let redirectUrl = `${origin}${next}`; 

      if (!isLocalEnv && forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
      }

      console.log(`OAuth successful, redirecting to: ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);

    } else {
        console.error('Supabase code exchange error:', exchangeError);
    }
  } else {
      console.error('No code found in callback request.');
  }

  console.log('OAuth callback failed, redirecting to error page.');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}