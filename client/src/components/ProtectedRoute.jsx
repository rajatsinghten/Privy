import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    // TODO: Implement proper authentication check
    // For now, always render children (placeholder behavior)
    if (!isAuthenticated) {
        // Placeholder: redirect to login when auth is implemented
        // return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
