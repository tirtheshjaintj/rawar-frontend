import { Outlet } from 'react-router-dom'
import Background from './components/Background'
import ModeBall from './components/modeBall'
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import Cookie from "universal-cookie";
import { addUser } from './store/userSlice';
import axiosInstance from './config/axiosConfig';
import { useEffect } from 'react';
import { addAdmin } from './store/adminSlice';

function App() {
  const cookie = new Cookie();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const admin = useSelector((state: any) => state.admin);

  const getUser = async () => {
    const userToken = cookie.get('user_token');
    if (!userToken) {
      return; // Exit if the seller token is not available
    }
    try {
      const response = await axiosInstance.get(`/user/getUser`, {
        withCredentials: true, // Keep this if you need credentials
      });
      const userData = response.data;
      if (userData.status) {
        dispatch(addUser(userData.user));
      } else {
        cookie.remove('user_token');
      }
    } catch (error: any) {
      if (!error.response.data.status) {
        cookie.remove('user_token');
      }
    }
  };

  const getAdmin = async () => {
    const adminToken = cookie.get('admin_token');
    if (!adminToken) {
      return; // Exit if the seller token is not available
    }
    try {
      const response = await axiosInstance.get(`/admin/getAdmin`, {
        withCredentials: true, // Keep this if you need credentials
      });
      const adminData = response.data;
      if (adminData.status) {
        dispatch(addAdmin(adminData.user));
      } else {
        cookie.remove('admin_token');
      }
    } catch (error: any) {
      if (!error.response.data.status) {
        cookie.remove('admin_token');
      }
    }
  };
  useEffect(() => {
    if (!admin) {
      getAdmin();
    }
    console.log("Admin", admin);
  }, [admin]);

  useEffect(() => {
    if (!user) {
      getUser();
    }
    console.log("User", user);
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Background>
        <Toaster position="bottom-right" />
        <Outlet />
        <ModeBall />
      </Background>
    </>
  )
}

export default App


