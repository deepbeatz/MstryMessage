import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// exporting the middleware for the authentication of the entire site
export {default} from 'next-auth/middleware'

// main function to perform all the middleware tasks
export async function middleware(request: NextRequest) {
    const token = await getToken({req:request});
    const url = request.nextUrl; //current url
    //redirection strategy (if we signed in ,i.e., we already have the token then redirect to dashboard)
    if(token &&
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/verify') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/')
        )
    ){
        return NextResponse.redirect(new URL('/dashboard',request.url))
    }
    //if token is not available it means we are not signed in, so redirected to signin page
    if(!token && url.pathname.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/sign-in',request.url))
    }
    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    //routes where we want the middleware to participate are listed in matcher array
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/verify/:path*',
        '/dashboard/:path*'
    ],
}