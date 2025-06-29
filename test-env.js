// Quick test to check environment variables
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, NEXTAUTH_SECRET } from "./src/app.js";

console.log("Discord Client ID:", DISCORD_CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Discord Client Secret:", DISCORD_CLIENT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("NextAuth Secret:", NEXTAUTH_SECRET ? "✅ Loaded" : "❌ Missing");
