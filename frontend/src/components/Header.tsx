import React from 'react';

interface HeaderProps {
  onLogout?: () => void;
  isAuthenticated: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, isAuthenticated, userName }) => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Audio Aula</h1>
          <span className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded">Beta</span>
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center">
            {userName && (
              <span className="mr-4 text-sm hidden sm:inline">
                Hola, {userName}
              </span>
            )}
            <button
              onClick={onLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-1 px-3 rounded transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div>
            <span className="text-sm">Bienvenido a Audio Aula</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
