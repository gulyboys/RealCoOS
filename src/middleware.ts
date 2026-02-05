import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const appPassword = process.env.APP_PASSWORD || 'realco2026';

    if (!authHeader) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    const authValue = authHeader.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === 'admin' && pwd === appPassword) {
        return NextResponse.next();
    }

    return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
