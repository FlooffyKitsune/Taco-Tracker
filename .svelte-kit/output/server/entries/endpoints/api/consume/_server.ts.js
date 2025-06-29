import { j as json } from "../../../../chunks/index.js";
import { r as recordTacoConsumption } from "../../../../chunks/userService.js";
const POST = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { tacoTypeId, quantity, sessionId } = await request.json();
    const result = await recordTacoConsumption(
      session.user.id,
      tacoTypeId,
      quantity,
      sessionId
    );
    return json(result);
  } catch (error) {
    console.error("Error recording consumption:", error);
    return json({ error: "Failed to record consumption" }, { status: 500 });
  }
};
export {
  POST
};
