import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.name}
    </div>
  );
}; 