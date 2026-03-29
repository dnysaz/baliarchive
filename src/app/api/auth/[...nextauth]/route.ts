import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

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
        
        const user = await prisma.user.findUnique({
          where: { email: searchEmail }
        });

        if (!user) {
          console.log('❌ Auth failure: User not found');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(inputPassword, user.password);

        if (!isPasswordValid) {
          console.log('❌ Auth failure: Invalid password');
          return null;
        }

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
