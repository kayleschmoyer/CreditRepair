'use client';
import { useState } from 'react';

interface Props<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function VirtualList<T>({ items, itemHeight, height, renderItem }: Props<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight));
  const visible = items.slice(start, end);
  const offset = start * itemHeight;
  return (
    <div style={{ overflowY: 'auto', height }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offset, left: 0, right: 0 }}>
          {visible.map((item, i) => renderItem(item, start + i))}
        </div>
      </div>
    </div>
  );
}
