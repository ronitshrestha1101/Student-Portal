import React from 'react';

const Skeleton = ({
  variant = 'text', // text, rect, circle
  width = '100%',
  height = '16px',
  className = '',
}) => {
  const style = {
    width,
    height,
  };

  return (
    <div
      className={`skeleton-element skeleton-${variant} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
