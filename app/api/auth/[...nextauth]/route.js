import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

const authOptions = {
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
                console.log('Starting authorization process...');
                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing email or password');
                    throw new Error('Please enter an email and password');
                }

                try {
                    console.log('Connecting to MongoDB...');
                    const client = await clientPromise;
                    const db = client.db();
                    console.log('Connected to MongoDB successfully');

                    console.log('Searching for user with email:', credentials.email);
                    const user = await db.collection('users').findOne({ email: credentials.email });

                    if (!user) {
                        console.log('User not found, checking if we should create new user');
                        if (credentials.username) {
                            console.log('Creating new user with username:', credentials.username);
                            const hashedPassword = await bcrypt.hash(credentials.password, 10);
                            const newUser = {
                                email: credentials.email,
                                password: hashedPassword,
                                username: credentials.username,
                                createdAt: new Date(),
                            };
                            const result = await db.collection('users').insertOne(newUser);
                            console.log('New user created with ID:', result.insertedId);
                            return {
                                id: result.insertedId.toString(),
                                email: newUser.email,
                                name: newUser.username,
                            };
                        }
                        console.log('No user found and no username provided for new user');
                        throw new Error('No user found with this email');
                    }

                    console.log('User found, verifying password');
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        console.log('Invalid password');
                        throw new Error('Invalid password');
                    }

                    console.log('Password verified, returning user data');
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.username,
                    };
                } catch (error) {
                    console.error('Error in authorization:', error);
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
    }
};

async function GET(request) {
    return NextAuth(request, authOptions);
}

async function POST(request) {
    return NextAuth(request, authOptions);
}

export { GET, POST };