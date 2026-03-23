import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import { PersonalContent } from './PersonalContent';

async function getAuthData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/');
  }

  const decoded = verifyUserToken(token);
  if (!decoded) {
    redirect('/');
  }

  const authDataCookie = cookieStore.get('auth_data')?.value;
  if (!authDataCookie) {
    redirect('/');
  }

  const authData = JSON.parse(Buffer.from(authDataCookie, 'base64').toString('utf-8'));

  return {
    id: decoded.userId,
    login: authData.login,
    name: authData.name ?? undefined,
    avatarUrl: authData.avatarUrl ?? undefined,
  };
}

export default async function PersonalPage() {
  const auth = await getAuthData();
  return <PersonalContent auth={auth} />;
}
