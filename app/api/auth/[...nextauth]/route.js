import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          throw new Error('Please enter an email and password');
        }

        try {
          const client = await clientPromise;
          console.log('MongoDB client connected successfully');
          const db = client.db();
          const user = await db.collection('users').findOne({ email: credentials.email });
          console.log('User lookup result:', user ? 'User found' : 'No user found');

          if (!user) {
            if (credentials.username) {
              const hashedPassword = await bcrypt.hash(credentials.password, 10);
              const newUser = {
                email: credentials.email,
                password: hashedPassword,
                username: credentials.username,
                createdAt: new Date(),
              };
              const result = await db.collection('users').insertOne(newUser);
              return {
                id: result.insertedId.toString(),
                email: newUser.email,
                name: newUser.username,
              };
            }
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
          };
        } catch (error) {
          console.error('MongoDB error:', error);
          throw error;
        }
      }
    })
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  debug: true,
};

const handler = async (req, res) => {
  return await NextAuth(req, res, authOptions);
};

export { handler as GET, handler as POST };