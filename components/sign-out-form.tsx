// import Form from 'next/form';

// // import { signOut } from '@/app/(auth)/auth';
// export const SignOutForm = () => {
//   return (
//     <Form
//       className="w-full"
//       action={async () => {
//         'use server';

//         await signOut({
//           redirectTo: '/',
//         });
//       }}
//     >
//       <button
//         type="submit"
//         className="w-full text-left px-1 py-0.5 text-red-500"
//       >
//         Sign out
//       </button>
//     </Form>
//   );
// };

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth'; // authOptionsのパスを適切に修正

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ message: 'No session' });
}
