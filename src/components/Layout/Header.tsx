import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DarkModeToggle } from '../Common/DarkModeToggle';

interface HeaderProps {
  isAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 w-full border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-semibold">
              AI Voice Chat
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                {[
                  { path: '/dashboard', label: 'Dashboard' },
                  { path: '/make-call', label: 'Make Call' },
                  { path: '/scenarios', label: 'Scenarios' },
                  { path: '/call-notes', label: 'Call Notes' },
                  { path: '/scheduled-meetings', label: 'Meetings' },
                  { path: '/settings', label: 'Settings' },
                ].map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`text-base font-medium transition-colors ${
                      isActiveRoute(path)
                        ? 'text-accent'
                        : 'text-text-light dark:text-text-dark hover:text-accent'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right side - Dark Mode and Logout */}
          <div className="flex items-center space-x-6">
            <DarkModeToggle />
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-base font-medium hover:text-accent transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 