import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ backgroundColor: '#15151e', borderBottom: '3px solid #e10600' }}
      className="px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <Link to="/" className="flex items-center gap-3 text-white no-underline">
        <span style={{ color: '#e10600', fontSize: '1.5rem', fontWeight: 900 }}>F1</span>
        <span className="font-bold text-lg tracking-wide">LEAGUE</span>
      </Link>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <>
            <Link to="/admin/leagues" className="text-sm text-gray-300 hover:text-white no-underline transition-colors">
              Admin Leghe
            </Link>
            <Link to="/admin/grands-prix" className="text-sm text-gray-300 hover:text-white no-underline transition-colors">
              Gestione GP
            </Link>
          </>
        )}
        <Link to="/" className="text-sm text-gray-300 hover:text-white no-underline transition-colors">
          Dashboard
        </Link>
        <span className="text-gray-500">|</span>
        <Link to="/profile" className="text-sm text-gray-400 hover:text-white no-underline transition-colors">
          {user?.username}
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded border border-gray-600 hover:border-red-600 text-gray-300 hover:text-white transition-all"
          style={{ background: 'transparent' }}
        >
          Esci
        </button>
      </div>
    </nav>
  );
}
