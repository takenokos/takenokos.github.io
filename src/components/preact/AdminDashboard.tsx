import { getToken, getRole } from '@/utils/jwt.ts'
import AdminUsers from './AdminUsers';

export default function Dashboard() {
  const token = getToken()
  const role = getRole()
  if (!token || role !== 'admin') {
    return <div>Access Denied</div>;
  }
  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
      <AdminUsers />
    </div>
  );
};
