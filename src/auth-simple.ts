import { SvelteKitAuth } from "@auth/sveltekit"
import Discord from "@auth/sveltekit/providers/discord"
import { env } from "$env/dynamic/private"

// Simple auth without Prisma adapter for testing
export const { handle: simpleHandle, signIn: simpleSignIn, signOut: simpleSignOut } = SvelteKitAuth({
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    })
  ],
  secret: env.NEXTAUTH_SECRET,
  trustHost: true
})
