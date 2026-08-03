export const getToken = () => {
  const token = localStorage.getItem("adminJWT");
  if (!token) window.location.href = "/admin/login"; // 未登录重定向
  return token;
};

export const getRole = () => {
  const token = getToken();
  if (!token) return "";
  const decoded = JSON.parse(atob(token.split(".")[1]));
  return decoded.role;
};

export const request = async <T = unknown>(
  url: string | URL | Request,
  opt?: RequestInit,
): Promise<T | undefined> => {
  const response = await fetch(url, {
    ...opt,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...opt?.headers,
    },
  });
  if (response.ok) return response.json() as Promise<T>;
  const json = await response.json().catch(() => null);
  alert(json?.error || response.statusText);
  switch (response.status) {
    case 401:
    case 403:
      window.location.href = "/admin/login";
      break;
    default:
    // window.location.href = "/admin/login";
  }
};
