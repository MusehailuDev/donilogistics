import React, { useEffect, useRef } from 'react';

// Amorph/switching logo loader displayed centered on page
// Uses two PNGs from public folder: "doni posible logo.png" and "doni posible logo 1.png"
const AmorphLoader = ({ size = 64, intervalMs = 600 }) => {
  const imgRef = useRef(null);
  const stateRef = useRef({ toggle: false });

  useEffect(() => {
    const timer = setInterval(() => {
      stateRef.current.toggle = !stateRef.current.toggle;
      if (imgRef.current) {
        imgRef.current.style.opacity = '0';
        setTimeout(() => {
          imgRef.current.src =
            (stateRef.current.toggle
              ? process.env.PUBLIC_URL + '/doni posible logo 1.png'
              : process.env.PUBLIC_URL + '/doni posible logo.png');
          imgRef.current.style.opacity = '1';
        }, 160);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <img
          ref={imgRef}
          src={process.env.PUBLIC_URL + '/doni posible logo.png'}
          alt="Loading"
          className="w-full h-full object-contain transition-opacity duration-200 ease-in-out drop-shadow-sm"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default AmorphLoader;



// Amorph/switching logo loader displayed centered on page
// Uses two PNGs from public folder: "doni posible logo.png" and "doni posible logo 1.png"
const AmorphLoader = ({ size = 64, intervalMs = 600 }) => {
  const imgRef = useRef(null);
  const stateRef = useRef({ toggle: false });

  useEffect(() => {
    const timer = setInterval(() => {
      stateRef.current.toggle = !stateRef.current.toggle;
      if (imgRef.current) {
        imgRef.current.style.opacity = '0';
        setTimeout(() => {
          imgRef.current.src =
            (stateRef.current.toggle
              ? process.env.PUBLIC_URL + '/doni posible logo 1.png'
              : process.env.PUBLIC_URL + '/doni posible logo.png');
          imgRef.current.style.opacity = '1';
        }, 160);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <img
          ref={imgRef}
          src={process.env.PUBLIC_URL + '/doni posible logo.png'}
          alt="Loading"
          className="w-full h-full object-contain transition-opacity duration-200 ease-in-out drop-shadow-sm"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default AmorphLoader;


