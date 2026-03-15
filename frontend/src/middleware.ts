import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем тему из куки
  const theme = request.cookies.get('theme')?.value || 'light';
  
  // Добавляем тему в заголовки для серверных компонентов
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-theme', theme);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};