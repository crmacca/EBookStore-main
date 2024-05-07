import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import axios from 'axios'
import LandingPage from './pages/unauth/landing';
import ErrorPage from './pages/unauth/error';
import ServerErrorPage from './pages/unauth/serverError';
import LoginPage from './pages/unauth/login';
import SignupPage from './pages/unauth/signup';
import AppPage from './pages/auth/app';
import BookForm from './pages/admin/admin_form';
import AdminBookForm from './pages/admin/admin_form';
import AdminOverview from './pages/admin/admin_dashboard';
import io from 'socket.io-client';
import BlackjackGame from './pages/auth/games/blackjack';
import StorePage from './pages/unauth/storePage';
import { Toaster } from 'react-hot-toast';
import BookReader from './pages/auth/ereader';
import AcceptableUsePolicy from './pages/unauth/acceptableUse';
import TetrisGame from './pages/auth/games/tetris';

function App() {
  const [user, setUser] = React.useState('loading')
  const [socket, setSocket] = React.useState(null);
  axios.defaults.withCredentials = true

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage user={user}/>,
      errorElement: <ErrorPage />
    },
    {
      path: '/servererr',
      element: <ServerErrorPage />,
      errorElement: <ErrorPage />
    },
    {
      path: '/login',
      element: <LoginPage user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/signup',
      element: <SignupPage user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/app',
      element: <AppPage user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/admin',
      element: <AdminOverview user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/admin/newbook',
      element: <AdminBookForm user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/admin/editbook',
      element: <AdminBookForm user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/blackjack',
      element: <BlackjackGame user={user} socket={socket} />,  // Pass the socket to the Blackjack game
      errorElement: <ErrorPage />
    },
    {
      path: '/tetris',
      element: <TetrisGame user={user} socket={socket} />,  // Pass the socket to the Tetris game
      errorElement: <ErrorPage />
    },
    {
      path: '/store/book/:id',
      element: <StorePage user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/app/read/:id',
      element: <BookReader user={user} />,
      errorElement: <ErrorPage />
    },
    {
      path: '/policies/use',
      element: <AcceptableUsePolicy />,
      errorElement: <ErrorPage />
    }
  ])

   const fetchAndSetCsrfToken = () => {
    if(window.location.pathname !== '/servererr') {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/csrf-token`)
      .then((response) => {
        const csrfToken = response.data.csrfToken;
        axios.defaults.headers.common['CSRF-Token'] = csrfToken;
      })
      .catch((error) => {
        console.error('Could not fetch CSRF token', error);
        window.location.pathname = '/servererr'
      });
    }
  };


  useEffect(() => {
    // Only establish the socket connection once user authentication is confirmed
    if (user !== 'loading' && user !== null) {
      const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
        path: '/socket.io/', // Ensure this is the correct path for your Socket.IO server
        withCredentials: true
      });
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]); // Dependency on user ensures socket is re-initialized only if user state changes


  useEffect(() => {
    fetchAndSetCsrfToken();

    const axiosInterceptor = axios.interceptors.response.use(
      response => {
        const { method } = response.config;
        if (['post', 'put', 'delete', 'patch'].includes(method)) {
          fetchAndSetCsrfToken();
        }
        return response;
      }, error => {
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
    };
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user`)
    .then((res) => {
      setUser(res.data.authenticated ? res.data.user : null)
    })
  }, [])

  return (
    <div className="App">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
