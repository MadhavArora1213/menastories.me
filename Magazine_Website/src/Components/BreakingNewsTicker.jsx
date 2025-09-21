import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BreakingNewsTicker = () => {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/public/homepage`);
        const json = await res.json();
        const list = (json.breaking || json.trending || []).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category?.name || ''
        }));
        setItems(list);
      } catch (e) {
        setItems([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setIndex(p => (p + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="font-bold text-xs tracking-wider">BREAKING</span>
        <span className="opacity-50">|</span>
        <Link to={`/article/${items[index].slug}`} className="truncate hover:underline">
          {items[index].title}
        </Link>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;

