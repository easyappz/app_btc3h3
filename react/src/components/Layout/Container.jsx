import React from 'react';

const Container = ({ children, className = '' }) => {
  return (
    <div
      data-easytag="id1-react/src/components/Layout/Container.jsx"
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
