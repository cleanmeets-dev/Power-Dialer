import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/Login';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    login(user);
    const roleHome = user?.role === 'manager' ? '/manager' : '/agent';
    navigate(roleHome);
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
