import { p as prisma } from "./database.js";
import { c as checkAndUnlockAchievements } from "./achievements.js";
async function createTacoSession(userId, participantIds) {
  const session = await prisma.tacoSession.create({
    data: {
      createdById: userId,
      participants: {
        create: participantIds.map((id) => ({
          userId: id
        }))
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
  return session;
}
async function recordTacoConsumption(userId, tacoTypeId, quantity, sessionId) {
  const consumption = await prisma.tacoConsumption.create({
    data: {
      userId,
      tacoTypeId,
      quantity,
      sessionId
    }
  });
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalTacosEaten: {
        increment: quantity
      },
      lastActiveAt: /* @__PURE__ */ new Date()
    }
  });
  if (sessionId) {
    await prisma.tacoSessionParticipant.updateMany({
      where: {
        sessionId,
        userId
      },
      data: {
        tacosConsumed: {
          increment: quantity
        }
      }
    });
  }
  const newAchievements = await checkAndUnlockAchievements(userId);
  return { consumption, newAchievements };
}
export {
  createTacoSession as c,
  recordTacoConsumption as r
};
