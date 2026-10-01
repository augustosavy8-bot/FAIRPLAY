import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import AdminPanel from './AdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { user } = await getAdmin();
  if (!user) redirect('/admin/login');
  return <AdminPanel userEmail={user.email} />;
}
