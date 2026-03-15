import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--dark-color)',
      color: 'white',
      padding: 'var(--spacing-xl) 0',
      marginTop: 'var(--spacing-xl)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-xl)'
      }}>
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>О проекте</h3>
          <p style={{ color: '#94a3b8' }}>
            Парсер квартир с CIAN.ru. Данные обновляются регулярно.
          </p>
        </div>
        
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Контакты</h3>
          <p style={{ color: '#94a3b8' }}>
            Email: info@cian-parser.ru<br />
            Telegram: @cian_parser
          </p>
        </div>
        
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Правовая информация</h3>
          <p style={{ color: '#94a3b8' }}>
            Данные взяты из открытых источников.
          </p>
        </div>
      </div>
      
      <div className="container" style={{
        marginTop: 'var(--spacing-xl)',
        paddingTop: 'var(--spacing-md)',
        borderTop: '1px solid #334155',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        © 2024 CIAN Parser. Все права защищены.
      </div>
    </footer>
  );
};

export default Footer;