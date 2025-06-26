import jwt from "jsonwebtoken";
import type { APIContext } from "astro";

// Throw an error if the JWT secret is not set in the environment.
if (!import.meta.env.JWT_SECRET_ADMIN) {
  throw new Error("JWT_SECRET_ADMIN is not set in the environment variables.");
}

export const JWT_SECRET = import.meta.env.JWT_SECRET_ADMIN;

/**
 * Represents the decoded JWT payload for an admin user.
 */
interface AdminJwtPayload {
  id: number;
  role: string;
  // Add other token fields if necessary, e.g., exp, iat
}

/**
 * Extracts the JWT token from the Authorization header.
 * @param authHeader The Authorization header string.
 * @returns The token string or null if the header is missing or malformed.
 */
const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

/**
 * Verifies the admin JWT token from a request and returns the decoded payload.
 * Throws a Response object with a specific status code on failure.
 *
 * @param request The Request object.
 * @returns A promise that resolves with the decoded admin payload.
 */
export const verifyAdminToken = async (
  request: Request,
): Promise<AdminJwtPayload> => {
  const token = extractTokenFromHeader(request.headers.get("Authorization"));

  if (!token) {
    throw new Response(
      JSON.stringify({ error: "No authorization token provided." }),
      { status: 401 },
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;

    if (decoded.role !== "admin") {
      throw new Response(
        JSON.stringify({ error: "Forbidden: User is not an admin." }),
        { status: 403 },
      );
    }

    return decoded;
  } catch (error) {
    // Catches errors from jwt.verify (e.g., token expired, invalid signature)
    throw new Response(JSON.stringify({ error: "Invalid or expired token." }), {
      status: 401,
    });
  }
};

/**
 * An example of how to use this in an Astro API route.
 * This function can be used as a middleware or at the beginning of an API endpoint.
 */
export const GET = async ({ request }: APIContext) => {
  try {
    const adminData = await verifyAdminToken(request);
    // Proceed with admin-only logic
    return new Response(
      JSON.stringify({ message: "Success", admin: adminData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500 },
    );
  }
};
