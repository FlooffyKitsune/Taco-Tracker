import { j as json } from "../../../../chunks/index.js";
import { p as prisma } from "../../../../chunks/database.js";
async function GET() {
  try {
    const tacoTypes = await prisma.tacoType.findMany({
      orderBy: { name: "asc" }
    });
    return json(tacoTypes);
  } catch (error) {
    console.error("Error fetching taco types:", error);
    return json({ error: "Failed to fetch taco types" }, { status: 500 });
  }
}
export {
  GET
};
