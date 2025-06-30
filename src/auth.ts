import { SvelteKitAuth } from "@auth/sveltekit"
import Discord from "@auth/sveltekit/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { env } from "$env/dynamic/private"

const prisma = new PrismaClient()

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      // Add user info from our database to the session
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            achievements: {
              include: {
                achievement: true
              }
            }
          }
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.totalTacosEaten = dbUser.totalTacosEaten
          session.user.totalTacoSessions = dbUser.totalTacoSessions
          // session.user.achievements = dbUser.achievements // TODO: Fix type mismatch
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Let PrismaAdapter handle everything - just return true
      return true
    }
  },
  events: {
    async createUser({ user }) {
      // This runs after PrismaAdapter creates the user successfully
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalTacosEaten: 0,
            totalTacoSessions: 0,
            joinedAt: new Date(),
            lastActiveAt: new Date()
          }
        });
        console.log('✅ User initialized with default values:', user.id);
      } catch (error) {
        console.error('❌ Error initializing new user:', error);
      }
    },
    async linkAccount({ user, account, profile }) {
      // This runs when an account is successfully linked
      if (account.provider === "discord" && profile) {
        try {
          const discordProfile = profile as any;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              discordId: discordProfile.id || null,
              username: discordProfile.username || null,
              discriminator: discordProfile.discriminator || null,
              globalName: discordProfile.global_name || null,
              lastActiveAt: new Date()
            }
          });
          console.log('✅ User updated with Discord info:', user.id);
        } catch (error) {
          console.error('❌ Error updating user with Discord info:', error);
        }
      }
    }
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true
})
