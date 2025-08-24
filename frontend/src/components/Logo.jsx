import React from 'react';

const Logo = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
    xxl: 'h-24'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src={process.env.PUBLIC_URL + '/doni-logo.png'}
        alt="Doni Logistics"
        className={`${sizeClasses[size]} w-auto select-none`}
        draggable={false}
      />
    </div>
  );
};

export default Logo;
