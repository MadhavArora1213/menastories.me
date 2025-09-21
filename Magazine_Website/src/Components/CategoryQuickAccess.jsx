import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CategoryQuickAccess = () => {
  const [nav, setNav] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/public/homepage`);
        const json = await res.json();
        setNav(json.navigation || []);
      } catch (e) {
        console.error('QuickAccess nav fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toSlug = (t) => `/${t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;

  if (loading || nav.length === 0) return null;

  const top = nav.filter(n => n.name !== 'HOME');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Explore Sections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {top.map((cat) => (
          <div key={cat.name} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">{cat.name}</h3>
              <Link className="text-sm text-blue-600 hover:text-blue-800 self-start sm:self-auto" to={toSlug(cat.name)}>View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(cat.subcategories || []).slice(0, 6).map((sub) => (
                <div key={typeof sub === 'string' ? sub : sub.name}>
                  <Link
                    to={`${toSlug(cat.name)}${toSlug(typeof sub === 'string' ? sub : sub.name)}`}
                    className="text-sm font-medium text-gray-800 hover:text-blue-600 block mb-1"
                  >
                    {typeof sub === 'string' ? sub : sub.name}
                  </Link>
                  {/* grandchildren list */}
                  <ul className="space-y-1">
                    {((typeof sub === 'string' ? [] : (sub.subcategories || [])).slice(0, 2)).map((g) => (
                      <li key={typeof g === 'string' ? g : g.name}>
                        <Link
                          to={`${toSlug(cat.name)}${toSlug(typeof sub === 'string' ? sub : sub.name)}${toSlug(typeof g === 'string' ? g : g.name)}`}
                          className="text-xs text-gray-600 hover:text-blue-600 block"
                        >
                          {typeof g === 'string' ? g : g.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryQuickAccess;

