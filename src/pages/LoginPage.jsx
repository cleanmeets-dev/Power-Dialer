import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/roleUtils';
import Login from '../components/Login';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (authData) => {
    login(authData);
    const roleHome = getRoleHomeRoute(authData?.user?.role);
    navigate(roleHome);
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
