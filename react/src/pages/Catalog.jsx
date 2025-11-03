import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Layout/Container';

const Catalog = () => {
  return (
    <div data-easytag="id1-react/src/pages/Catalog.jsx">
      <Container className="py-10">
        <div data-easytag="id2-react/src/pages/Catalog.jsx" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div data-easytag="id3-react/src/pages/Catalog.jsx">
            <h1 data-easytag="id4-react/src/pages/Catalog.jsx" className="text-2xl font-semibold text-brand">Каталог объявлений</h1>
            <p data-easytag="id5-react/src/pages/Catalog.jsx" className="text-sm text-zinc-600">Используйте фильтры, чтобы сузить поиск.</p>
          </div>
          <div data-easytag="id6-react/src/pages/Catalog.jsx" className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
            <select data-easytag="id7-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              <option data-easytag="id8-react/src/pages/Catalog.jsx">Марка</option>
            </select>
            <select data-easytag="id9-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              <option data-easytag="id10-react/src/pages/Catalog.jsx">Модель</option>
            </select>
            <select data-easytag="id11-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              <option data-easytag="id12-react/src/pages/Catalog.jsx">Год</option>
            </select>
            <select data-easytag="id13-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              <option data-easytag="id14-react/src/pages/Catalog.jsx">Цена</option>
            </select>
          </div>
        </div>

        <div data-easytag="id15-react/src/pages/Catalog.jsx" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Link
              key={i}
              data-easytag="id16-react/src/pages/Catalog.jsx"
              to={`/listing/${i + 1}`}
              className="rounded border border-zinc-200 bg-white overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div data-easytag="id17-react/src/pages/Catalog.jsx" className="aspect-video w-full bg-zinc-100" />
              <div data-easytag="id18-react/src/pages/Catalog.jsx" className="p-3">
                <h3 data-easytag="id19-react/src/pages/Catalog.jsx" className="text-sm font-semibold text-brand">Объявление #{i + 1}</h3>
                <p data-easytag="id20-react/src/pages/Catalog.jsx" className="text-xs text-zinc-600">Марка / Модель · Год · Пробег</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Catalog;
