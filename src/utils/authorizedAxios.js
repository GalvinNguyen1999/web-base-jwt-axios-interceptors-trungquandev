// Author: TrungQuanDev: https://youtube.com/@trungquandev

import axios from 'axios'
import { toast } from 'react-toastify'

let authorizedAxiosInstance = axios.create()

// Cancel request khi bị treo 10 phút, thời gian chờ tối đa của 1 request là 10 phút
authorizedAxiosInstance.defaults.timeout = 10 * 60 * 1000 // 10 phút

// Cho phép gửi cookie kèm theo request phục vụ trường hợp lưu access token và refresh token trong httpOnly cookie
authorizedAxiosInstance.defaults.withCredentials = true

// Config interceptor cho axios giúp xử lý ở giữa mỗi request và response
// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Do something before request is sent

    // Lấy access token từ local storage
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      // Lưu ý: Phải có 'Bearer ' (có khoảng trắng) trước access token vì theo chuẩn Oauth2 trong việc xác định loại token đang sử dụng
      // Bearer là định nghĩa loại token dành cho việc xác thực và uỷ quyền, tham khảo các loại token khác như: Basic Token, Digest Token, OAuth token ...
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    // Ngoại trừ lỗi 410: Gone vì phục vụ cho việc refresh token
    if (error.response.status !== 410) {
      toast.error(error.response?.data?.message || error?.message)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance;
