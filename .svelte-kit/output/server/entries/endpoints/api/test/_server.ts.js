import { j as json } from "../../../../chunks/index.js";
import { p as prisma } from "../../../../chunks/database.js";
async function GET() {
  try {
    await prisma.$connect();
    const tacoTypeCount = await prisma.tacoType.count();
    const achievementCount = await prisma.achievement.count();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    return json({
      success: true,
      database: "connected",
      counts: {
        tacoTypes: tacoTypeCount,
        achievements: achievementCount,
        users: userCount
      }
    });
  } catch (error) {
    console.error("Database test error:", error);
    return json({
      success: false,
      error: error.message,
      database: "disconnected"
    }, { status: 500 });
  }
}
export {
  GET
};
