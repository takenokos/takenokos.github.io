import { getToken, getRole } from '@/utils/jwt.ts'

export default function Dashboard() {
  const token = getToken()
  const role = getRole()
  if (!token || role !== 'admin') {
    return <div>Access Denied</div>;
  }
  return (
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
  );
};
