'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';

interface SyncHeightLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function SyncHeightLayout({ leftContent, rightContent }: SyncHeightLayoutProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!leftRef.current) return;

    const updateHeight = () => {
      if (leftRef.current) {
        setLeftHeight(leftRef.current.offsetHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(leftRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div ref={leftRef}>
        {leftContent}
      </div>

      <div 
        className="flex flex-col overflow-hidden"
        style={{ height: leftHeight ? `${leftHeight}px` : 'auto' }}
      >
        <div className="flex-1 overflow-y-auto">
          {rightContent}
        </div>
      </div>
    </div>
  );
}
