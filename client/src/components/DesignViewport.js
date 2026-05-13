import { useLayoutEffect, useRef, useState } from 'react';

/** Full canvas width: play-area outer 810px + right column 200px. */
export const APP_VIEWPORT_DESIGN_WIDTH = 1010;
/** Full canvas height: play-area 500px content + 5px top and bottom border. */
export const APP_VIEWPORT_DESIGN_HEIGHT = 510;

/**
 * Scales fixed "design px" children to fit the available rectangle without page scroll.
 * Children should use position:absolute within the canvas using (0,0) as the design origin.
 */
function DesignViewport({ designWidth, designHeight, children, className = '' }) {
  const shellRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;
      const s = Math.min(w / designWidth, h / designHeight, 1);
      setScale(s);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [designWidth, designHeight]);

  return (
    <div
      ref={shellRef}
      className={['design-viewport-shell', className].filter(Boolean).join(' ')}
    >
      <div
        className="design-viewport-stage"
        style={{
          width: designWidth * scale,
          height: designHeight * scale,
        }}
      >
        <div
          className="design-viewport-canvas"
          style={{
            width: designWidth,
            height: designHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DesignViewport;
