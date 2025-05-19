export const getToken = () => {
  const token = localStorage.getItem('adminJWT')
  if (!token)
    window.location.href = '/admin/login'; // 未登录重定向
  return token
}

export const getRole = () => {
  const token = getToken()
  if (!token) return ''
  const decoded = JSON.parse(atob(token.split('.')[1]));
  return decoded.role
}
