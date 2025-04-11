// import { auth } from '@/app/(auth)/auth';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("session_user: ", session)
  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  // const chats = await getChatsByUserId({ id: session.user.id! });

  const chats = await getChatsByUserId({ id: "db4ec12f-4339-49fe-99a5-fee97fa68962" });
  return Response.json(chats);
}
