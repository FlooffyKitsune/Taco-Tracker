import { j as json } from "../../../../chunks/index.js";
import { p as prisma } from "../../../../chunks/database.js";
import { c as createTacoSession } from "../../../../chunks/userService.js";
const GET = async ({ url, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const activeSessions = await prisma.tacoSession.findMany({
      where: {
        isActive: true,
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true
          }
        },
        orders: {
          include: {
            tacoType: true
          }
        }
      }
    });
    return json(activeSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { participantIds } = await request.json();
    const allParticipants = participantIds.includes(session.user.id) ? participantIds : [session.user.id, ...participantIds];
    const tacoSession = await createTacoSession(session.user.id, allParticipants);
    return json(tacoSession);
  } catch (error) {
    console.error("Error creating session:", error);
    return json({ error: "Failed to create session" }, { status: 500 });
  }
};
export {
  GET,
  POST
};
