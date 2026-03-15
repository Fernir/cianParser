import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      background: 'white',
      boxShadow: 'var(--box-shadow)',
      padding: 'var(--spacing-md) 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--primary-color)'
        }}>
          🏠 CIAN Parser
        </Link>
        
        <nav style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <Link to="/" style={{ color: 'var(--dark-color)' }}>Главная</Link>
          <Link to="/about" style={{ color: 'var(--dark-color)' }}>О проекте</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;