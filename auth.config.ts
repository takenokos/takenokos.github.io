import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { defineConfig } from 'auth-astro';
import { db } from './src/db/schema.ts'


export default defineConfig({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: import.meta.env.AUTH_GITHUB_ID,
      clientSecret: import.meta.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: import.meta.env.AUTH_GOOGLE_ID,
      clientSecret: import.meta.env.AUTH_GOOGLE_SECRET
    })
  ],
  callbacks: {
    redirect: ({ baseUrl }) => {
      return baseUrl + '/'
    },
    session({ session }) {
      // if (session.user) {
      //   session.user.id = user.id;
      // }
      return session;
    }
  }
});
