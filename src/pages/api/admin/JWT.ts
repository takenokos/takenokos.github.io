import jwt from 'jsonwebtoken';

export const JWT_SECRET = import.meta.env.JWT_SECRET_ADMIN || 'admin-secret-key'; // Separate secret for admin

export const verifyAdminToken = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No token provided');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    if (decoded.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
