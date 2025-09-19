import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Простая защита маршрутов по cookie роли, установленной на клиенте.
// Для продакшена рекомендуется серверная проверка токена и роли.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('role')?.value;
  
  // Отладочная информация (удалить в продакшене)
  console.log(`Middleware: ${pathname}, role: ${role || 'none'}`);

  // Разрешаем общедоступные пути
  const publicPaths = ['/auth', '/favicon.ico', '/_next', '/public', '/'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Если нет роли — отправляем на /auth (кроме главной страницы)
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Роутинг по ролям - перенаправляем авторизованных пользователей на их дашборды
  if (pathname === '/' || pathname === '') {
    // Если есть роль, перенаправляем на соответствующий дашборд
    if (role) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'dispatcher' ? '/dispatcher/dashboard' : role === 'driver' ? '/driver/dashboard' : '/admin';
      return NextResponse.redirect(url);
    }
    // Если роли нет, показываем лендинг
    return NextResponse.next();
  }

  if (pathname.startsWith('/dispatcher') && role !== 'dispatcher') {
    const url = request.nextUrl.clone();
    url.pathname = role === 'driver' ? '/driver/dashboard' : '/auth';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/driver') && role !== 'driver') {
    const url = request.nextUrl.clone();
    url.pathname = role === 'dispatcher' ? '/dispatcher/dashboard' : '/auth';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};


