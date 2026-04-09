import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT } from '~/utils/constants'

export const handleLogoutApi = async () => {
  /* chỉ sủ dụng 1 trong 2 cách  */

  // Trường họp 01: Dùng localStorage > chỉ xoá thông tin user trong localStorage phía FE
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')

  // Trường hợp 02: Dùng Http only Cookies > Gọi API để xử lý remove cookies
  return await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
}

export const handleRefreshTokenApi = async (refreshToken) => {
  return await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, { refreshToken })
}