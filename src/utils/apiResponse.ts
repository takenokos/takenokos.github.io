export interface PaginationParams {
  limit: number;
  offset: number;
}

export const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const errorResponse = (
  error: string,
  status = 500,
  details?: unknown,
): Response =>
  jsonResponse(
    {
      error,
      ...(details === undefined ? {} : { details }),
    },
    status,
  );

export const responseFromError = (
  error: unknown,
  fallbackMessage = "An unexpected error occurred.",
  fallbackStatus = 500,
): Response => {
  if (error instanceof Response) return error;
  if (error instanceof Error)
    return errorResponse(error.message, fallbackStatus);
  return errorResponse(fallbackMessage, fallbackStatus);
};

export const parsePaginationParams = (
  searchParams: URLSearchParams,
  defaults: PaginationParams = { limit: 10, offset: 0 },
): PaginationParams => {
  const rawLimit = Number(searchParams.get("limit"));
  const rawOffset = Number(searchParams.get("offset"));

  const limit = Number.isInteger(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : defaults.limit;
  const offset = Number.isInteger(rawOffset)
    ? Math.max(rawOffset, 0)
    : defaults.offset;

  return { limit, offset };
};
