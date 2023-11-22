import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

/* Adding Authentication (Chapter 15)
 
Authentication is a key part of many web applications today. It's how a system
checks if the user is who they say they are. A secure website often uses
multiple ways to check a user's identity.

For instance, after entering your username and password, the site may send a
verification code to your device or use an app like Google Authenticator. This
2-factor authentication (2FA) helps increase security. Even if someone learns
your password, they can't access your account without your unique token.

Auth.js abstracts away much of the complexity involved in managing sessions,
sign-in and sign-out, and other aspects of authentication.

While you can manually implement these features, its time-consuming and error
prone. Auth.js simplifies the process, providing a unified solution.

* Setting up NextAuth.js

Install `npm install next-auth@beta` which is compatible with Next.js 14.

Next, generate a secret key for your application. This key is used to encrypt
cookies, ensuring the security of user sessions. You can do this by running the
following command in your terminal: openssl rand -base64 32

Then in your .env file, add your generated key AUTH_SECRET=here.

For auth to work in production, you'll need to update your environment variables
in your Vercel project too.

* Adding the pages option

Create an auth.config.ts file at the root of our project that exports an
authConfig object. This object will contain the configuration options for
NextAuth.js. For now, it will only contain the pages option:

You can use the pages option to specify the route for custom sign-in, sign-out,
and error pages. This is not required, but by adding pages option means the user
will be redirected to a custom login page, rather the NextAuth.js default page.

* Protecting your routes with Next.js Middleware

Let's add the logic to protect your routes. This will prevent users from
accessing the dashboard pages unless they are logged in.

```ts
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
```

The `authorized` callback is used to verify if the request is authorized to
access a page via Next.js middleware.

It is called before a `request` is completed, and it receives an object with the
`auth` and `request` properties. The `auth` property contains the user's
session, and the `request` property contains the incoming request.

The `providers` option is an array where you list different login options. For
now, it's an empty array to satisfy NextAuth config.

Next, you will need to import the authConfig object into a Middleware file. In
the root of your project, create a file called middleware.ts.

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

Here you're initializing NextAuth.js with the authConfig object and exporting
the auth property. You're also using the `matcher` option from Middleware to
specify that it should run on specific paths.

The advantage of employing Middleware for this task is that the protected routes
will not even start rendering until the Middleware verifies the authentication,
enhancing both the security and performance of your application.
*/
