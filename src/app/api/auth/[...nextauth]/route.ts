import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Auth failure: Missing credentials');
          return null;
        }

        const searchEmail = credentials.email.toLowerCase().trim();
        const inputPassword = credentials.password.trim();
        
        // Use a safer way to access the model if TypeScript is complaining
        const db = prisma as any;
        
        // Explicitly check for 'user' or 'User' model (Prisma can be inconsistent with case in runtime)
        const userModel = db.user || db.User;
        
        if (!userModel) {
          console.error('❌ CRITICAL ERROR: Model "user" not found on Prisma client.');
          console.log('Available models in this process:', Object.keys(db).filter(k => !k.startsWith('_')));
          console.log('PLEASE RESTART YOUR DEV SERVER (npm run dev)');
          return null;
        }
        
        const user = await userModel.findUnique({
          where: { email: searchEmail }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(inputPassword, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
