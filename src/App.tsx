import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ECommerce from './pages/Dashboard/ECommerce';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Loader from './common/Loader';
import routes from './routes';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Function to check if the token is still valid
  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Example of token expiration check, assuming the token is a JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isTokenExpired = payload.exp * 1000 < Date.now();
      if (isTokenExpired) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    checkTokenValidity();
    setTimeout(() => setLoading(false), 1000);

    // Check token validity at regular intervals
    const intervalId = setInterval(checkTokenValidity, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/auth/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/auth/signin" />} />
          </>
        ) : (
          <Route element={<DefaultLayout />}>
            <Route index element={<ECommerce />} />
            {routes.map((route, index) => {
              const { path, component: Component } = route;
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <Suspense fallback={<Loader />}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;
