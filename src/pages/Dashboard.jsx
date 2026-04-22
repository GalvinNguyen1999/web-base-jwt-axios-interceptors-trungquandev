// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT, TAB_URLS } from '~/utils/constants'
import { handleLogoutApi } from '~/apis'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import BannerImage from '~/assets/banner.jpg'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      // await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      setUser(res.data)
    }
    fetchData()
  }, [])

  const [tab, setTab] = useState(TAB_URLS.DASHBOARD);
  const handleChangeTab = (event, newValue) => {
    setTab(newValue)
  }


  // useEffect(() => {
  //   const fetchData = async () => {
  //     return await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //   }

  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     return await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //   }

  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     return await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //   }

  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     return await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //   }

  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     return await authorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //   }

  //   fetchData()
  // }, [])

  const handleLogout = async () => {
    await handleLogoutApi()

    navigate('/login')
  }

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  console.log('user', user)

  return (
    <Box sx={{
      maxWidth: '1120px',
      margin: '0 auto',
      gap: 2,
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em'
    }}>
      <Box as={Link} to=''>
        <Box
          component='img'
          sx={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '6px'
          }}
          src={BannerImage}
          alt='banner image'
        />
      </Box>

      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      <Alert
        severity="success"
        variant='outlined'
        sx={{ 
          '.MuiAlert-message': { overflow: 'hidden' },
          width: { md: 'max-content' }
        }}
      >
        Role hiện tại của user đang đăng nhập là:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>
          {user?.role}
        </Typography>
      </Alert>

      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            <Tab label="Dashboard" value={TAB_URLS.DASHBOARD} />
            <Tab label="Support" value={TAB_URLS.SUPPORT} />
            <Tab label="Messages" value={TAB_URLS.MESSAGES} />
            <Tab label="Revenue" value={TAB_URLS.REVENUE} />
            <Tab label="Admin Tools" value={TAB_URLS.ADMIN_TOOLS} />
          </TabList>
        </Box>

        <TabPanel value={TAB_URLS.DASHBOARD}>
          <Alert severity="success">
            Đây là trang Dashboard sau khi user:&nbsp;
            <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
            &nbsp; đăng nhập thành công thì mới cho truy cập vào.
          </Alert>
        </TabPanel>

        <TabPanel value={TAB_URLS.SUPPORT}>
          <Alert severity="success">
            Đây là trang Support sau khi user:&nbsp;
            <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
            &nbsp; đăng nhập thành công thì mới cho truy cập vào.
          </Alert>
        </TabPanel>

        <TabPanel value={TAB_URLS.MESSAGES}>
          <Alert severity="success">
            Đây là trang Messages sau khi user:&nbsp;
            <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
            &nbsp; đăng nhập thành công thì mới cho truy cập vào.
          </Alert>
        </TabPanel>

        <TabPanel value={TAB_URLS.REVENUE}>
          <Alert severity="success">
            Đây là trang Revenue sau khi user:&nbsp;
            <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
            &nbsp; đăng nhập thành công thì mới cho truy cập vào.
          </Alert>
        </TabPanel>

        <TabPanel value={TAB_URLS.ADMIN_TOOLS}>
          <Alert severity="success">
            Đây là trang Admin Tools sau khi user:&nbsp;
            <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
            &nbsp; đăng nhập thành công thì mới cho truy cập vào.
          </Alert>
        </TabPanel>
      </TabContext>

      <Button variant="contained" color="primary" onClick={handleLogout} size='small' sx={{ width: 'fit-content', alignSelf: 'flex-end' }}>
        Logout
      </Button>

      <Divider sx={{ my: 2 }} />

    </Box>
  )
}

export default Dashboard
