import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsHidden(false);
      
      // Move dot instantly
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const onMouseLeave = () => {
      setIsHidden(true);
    };

    const onMouseEnter = () => {
      setIsHidden(false);
    };

    // Smooth trailing animation for the ring
    const render = () => {
      // Lerp formula: current = current + (target - current) * speed
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

      requestAnimationFrame(render);
    };

    const animFrame = requestAnimationFrame(render);

    // Hover state detection for buttons/links
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Check if target is clickable
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.glass-card') || 
        target.closest('.nav-btn') || 
        target.closest('.btn') || 
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        className={`custom-cursor-dot ${isHovering ? 'hovering' : ''} ${isHidden ? 'hidden' : ''}`}
      />
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring ${isHovering ? 'hovering' : ''} ${isHidden ? 'hidden' : ''}`}
      />
    </>
  );
};

export default CustomCursor;
