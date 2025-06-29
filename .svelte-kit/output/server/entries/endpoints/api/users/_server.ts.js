import { j as json } from "../../../../chunks/index.js";
import { p as prisma } from "../../../../chunks/database.js";
async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { totalTacosEaten: "desc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        image: true,
        totalTacosEaten: true,
        totalTacoSessions: true,
        globalName: true,
        username: true
      }
    });
    return json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
export {
  GET
};
