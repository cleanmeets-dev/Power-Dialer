import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/Login';

/**
 * LoginPage - Login page component
 * Handles login submission and navigation to dashboard
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    login(user);
    navigate('/dashboard');
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
