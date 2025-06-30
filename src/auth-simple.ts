import { SvelteKitAuth } from "@auth/sveltekit"
import Discord from "@auth/sveltekit/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { env } from "$env/dynamic/private"

const prisma = new PrismaClient()

// Auth with Prisma adapter for database integration
export const { handle: simpleHandle, signIn: simpleSignIn, signOut: simpleSignOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    })
  ],
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
        }
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
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
