import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Debug: log cookies received and auth state
  const cookies = request.cookies.getAll();
  const sbCookies = cookies.filter(c => c.name.startsWith('sb-'));
  console.log('[proxy] Cookies received:', sbCookies.map(c => c.name));
  console.log('[proxy] Cookie names + first 10 chars of value:', sbCookies.map(c => `${c.name}=${c.value.slice(0,10)}...`));

  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('[proxy] getUser() user:', user?.email ?? 'null', 'error:', error?.message ?? 'none');

  // Protect /dashboard — redirect to auth if not logged in
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
