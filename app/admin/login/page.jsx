import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const { user } = await getAdmin();
  if (user) redirect('/admin');
  return <LoginForm />;
}
