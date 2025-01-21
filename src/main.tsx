import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, createRoutesFromChildren, Route, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home.tsx';
import { Provider } from 'react-redux';
import store from './store/store';
import Login from "./pages/Login.tsx";
import User_Dashboard from "./pages/user/User_Dashboard";
import User_Signup from './pages/user/User_Signup.tsx';
import Forgot_Password from './pages/Forgot_Password.tsx';
import Quiz from './pages/Quiz.tsx';
import Result from './pages/Result.tsx';
import Prepare from './pages/Prepare.tsx';

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/user/login" element={<Login type="user" />} />
      <Route path="/user/dashboard" element={<User_Dashboard />} />
      <Route path="/user/signup" element={<User_Signup />} />
      <Route path="/user/forgot" element={<Forgot_Password type="user" />} />
      <Route path="/quiz/:category_id" element={<Quiz />} />
      <Route path="/prepare/:category_id" element={<Prepare />} />
      <Route path="/result/:result_id" element={<Result />} />
    </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID} >
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </GoogleOAuthProvider>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
