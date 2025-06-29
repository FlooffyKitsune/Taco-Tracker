import { j as json } from "../../../../chunks/index.js";
import { p as prisma } from "../../../../chunks/database.js";
async function addEmailConstraint() {
  try {
    await prisma.$executeRaw`ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email")`;
    return json({
      success: true,
      message: "Unique constraint added to email field successfully"
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return json({
        success: true,
        message: "Email unique constraint already exists"
      });
    }
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
async function POST() {
  return await addEmailConstraint();
}
async function GET() {
  return await addEmailConstraint();
}
export {
  GET,
  POST
};
