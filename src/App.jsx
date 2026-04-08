// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'

/*
  * Giải pháp clean code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
  * sử dụng <Outlet /> của react-router-dom để hiện thị các child route
 */
const ProtectedRoutes = () => {
  const user = localStorage.getItem('userInfo')
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

const UnauthorizedRoutes = () => {
  const user = localStorage.getItem('userInfo')
  if (user) return <Navigate to='/dashboard' replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <Navigate to="/login" replace={true} />
      } />

      <Route element={<UnauthorizedRoutes />}>
        <Route path='/login' element={<Login />} />
      </Route>

      {/* Các route cần đăng nhập tài khoản xong thì mới cho truy cập */}
      <Route element={<ProtectedRoutes />}>
        {/* <Outlet /> sẽ chạy vào các child route trong này */}
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
