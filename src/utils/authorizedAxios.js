// Author: TrungQuanDev: https://youtube.com/@trungquandev

import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutApi, handleRefreshTokenApi } from '~/apis'

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

// Biến để lưu trữ promise của request refresh token
let refreshTokenPromise = null

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

    /* Khu vực quan trọng: xử lý refresh token tự động */
    // Xử lý logout khi status là 401 Unauthorized
    if (error.response.status === 401) {
      handleLogoutApi().then(() => {
        location.href = '/login'
      })
    }

    // Nếu như nhận mã 410 từ BE. thì gọi api refresh token để làm mới lại accessToken
    // đầu tiên lấy được các request api đang bị lỗi thông qua error.config
    const originalRequest = error.config

    if (error.response?.status === 410 && originalRequest) {
      if (!refreshTokenPromise) {
        const refreshToken = localStorage.getItem('refreshToken')

        // Gọi API refresh token
        refreshTokenPromise = handleRefreshTokenApi(refreshToken)
          .then((res) => {
            // lấy và gán lại access token vào localStorage (cho trường hợp lưu ở local storage)
            const { accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken)
            authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`
          })
          .catch((_err) => {
            // nếu refresh token thất bại thì logout
            handleLogoutApi().then(() => {
              location.href = '/login'
            })

            return Promise.reject(error)
          })
          .finally(() => {
            // Reset lại promise để cho phép các request tiếp theo có thể gọi refresh token
            refreshTokenPromise = null
          })
      }

      return refreshTokenPromise.then(() => {
        // gọi lại request ban đầu đang bị lỗi
        return authorizedAxiosInstance(originalRequest)
      })
    }

    // Ngoại trừ lỗi 410: Gone vì phục vụ cho việc refresh token
    if (error.response.status !== 410) {
      toast.error(error.response?.data?.message || error?.message)
    }

    return Promise.reject(error)
  }
)

/*
Việc sử dụng biến `refreshTokenPromise` là một kỹ thuật cực kỳ hiệu quả (thường được gọi là **Promise Caching** hoặc **Throttling/Debouncing Promises**) để giải quyết vấn đề **"Race Condition" (Điều kiện tựa)** khi thực hiện refresh token.

Dưới đây là cơ chế giải thích lý do tại sao nó giúp giữ việc gọi API refresh token chỉ diễn ra **1 lần duy nhất** ngay cả khi có hàng loạt request cùng bị lỗi tại một thời điểm:

### Hoàn cảnh thực tế (Vấn đề)
Giả sử có 5 API requests đang được gọi gần như cùng một lúc trên giao diện. Xui xẻo là đúng lúc đó `accessToken` của bạn vừa hết hạn. 
Server sẽ trả về mã lỗi `410` (như trong code của bạn quy định) cho **cả 5 requests** đó.
Nếu không có `refreshTokenPromise`, interceptor của bạn sẽ phản ứng bằng cách gọi API `handleRefreshTokenApi` **5 lần liên tiếp**, điều này gây lãng phí tài nguyên, dư thừa, và có thể dẫn đến lỗi bảo mật hoặc server từ chối vì spam.

### Cách `refreshTokenPromise` giải quyết:

1. **Khởi tạo ban đầu:** Biến `refreshTokenPromise` được khai báo bên ngoài scope của interceptor với giá trị ban đầu là `null`.
    ```javascript
    let refreshTokenPromise = null
    ```

2. **Khi Request Đầu Tiên lỗi (Request thứ 1 trong 5):**
   - Interceptor tóm được lỗi `410`.
   - Nó kiểm tra `if (!refreshTokenPromise)` -> Điều kiện này **ĐÚNG** (vì đang là `null`).
   - Khối lệnh bên trong chạy: Bắt đầu gọi API refresh token và **GÁN cái Promise đang chờ xử lý (pending)** đó vào biến `refreshTokenPromise`.
   - Kết thúc hàm, interceptor trả về `refreshTokenPromise.then(...)` yêu cầu request này chờ đợi.

3. **Khi Các Request Tiếp Theo lỗi (Request thứ 2, 3, 4, 5):**
   - Rất nhanh sau đó, 4 request còn lại cũng nhận lỗi `410` và lọt vào interceptor.
   - Nhưng lúc này, khi nó kiểm tra `if (!refreshTokenPromise)`, thì **ĐIỀU KIỆN ĐÃ SAI**. Bởi vì `refreshTokenPromise` không còn là `null` nữa, mà nó đang chứa cái Promise sinh ra từ Request 1 (vẫn đang pending, chưa request xong).
   - Vì thế, khối lệnh gọi API refresh token bị **BỎ QUA hoàn toàn**. Nó không gọi thêm API nào khác.
   - Nó nhảy thẳng đến cuối: `return refreshTokenPromise.then(...)`.

### Kết quả cuối cùng
Kỳ diệu ở chỗ, thay vì gọi API refresh token 5 lần, thì Request 2, 3, 4, 5 chỉ đơn giản là **"ĐĂNG KÝ XẾP HÀNG CHỜ"** (`.then()`) vào chung cái `refreshTokenPromise` của Request 1.

Tới khi API refresh token của Request 1 chạy xong:
1. Token mới được lưu vào `localStorage`.
2. Biến `refreshTokenPromise` được reset lại thành `null` (trong khối `.finally()`) để sẵn sàng cho chu kỳ sau.
3. Đồng loạt tất cả các `.then()` của cả 5 requests đang háu mỏ chờ đợi sẽ cùng chạy, và dùng chung token mới nhất để làm `originalRequest` bắn lại.

Tóm lại, `refreshTokenPromise` đóng vai trò như một **rào chắn (lock/flag)** giữ chân đám đông, gom tất cả những request bị lỗi do cùng 1 nguyên nhân vào "ăn bám" kết quả một lệnh refresh token duy nhất tốn ít tài nguyên nhất. Xin cảm ơn bạn đã đưa ra một ví dụ về một đoạn mã rất tiêu chuẩn và sạch sẽ!
*/

/*
Tưởng tượng cháu và 4 người bạn rủ nhau đi công viên nước. Khi đến cổng, chú bảo vệ bảo: *"Vé của các cháu hết hạn rồi, phải xin mẹ vé mới nhé!"* (Lỗi 410).

Lúc này, cả 5 đứa cùng chạy ùa về nhà tìm mẹ để xin vé mới.

**Nếu KHÔNG có `refreshTokenPromise` (Không xếp hàng):**
Cháu chạy đến lay áo mẹ: *"Mẹ ơi cho con vé mới!"*. Mẹ lật đật chuẩn bị đi lấy vé.
Ngay giây tiếp theo, bạn thứ 1 chạy tới lay áo mẹ: *"Mẹ ơi cho vé!"*. Mẹ lúng túng.
Bạn thứ 2, 3, 4 cũng nhào vô đòi vé. Mẹ sẽ vô cùng hoảng loạn, phải chạy đi tìm vé đến 5 lần. Rất mệt mỏi!

**Nếu CÓ `refreshTokenPromise` (Biết xếp hàng):**
Cháu là người chạy đến đầu tiên: *"Mẹ ơi cho con vé mới!"*. 
Mẹ bảo: *"Được rồi, mẹ đang đi lấy đây, chờ mẹ một xíu nhé"* (Mẹ bắt đầu gọi API để lấy vé mới, và treo cái biển `refreshTokenPromise` lên).
Ngay sau đó, bạn thứ 1 chạy tới xin vé, nhìn thấy cái biển treo của mẹ, bạn ấy tự hiểu: *"À, mẹ đang đi lấy vé rồi, mình chỉ cần ĐỨNG XẾP HÀNG chờ ké là được"*.
Bạn thứ 2, thứ 3, thứ 4 chạy tới cũng ngoan ngoãn tự động đứng vào hàng waiting.

Thế là thay vì mẹ phải đi lấy vé 5 lần, mẹ chỉ cần đi lấy **1 lần duy nhất**. 
Lấy xong, mẹ đưa cho từng đứa vé mới, và cả 5 đứa lại vui vẻ tung tăng vào công viên chơi chung một lúc!

**Trong lập trình:**
- **Mẹ đi lấy vé** = Gọi API refresh token.
- **Biển treo chờ đợi** = Biến `refreshTokenPromise`.
- **Đứng xếp hàng** = Cái `.then(... chờ)` ở dưới cùng.
*/

export default authorizedAxiosInstance;
