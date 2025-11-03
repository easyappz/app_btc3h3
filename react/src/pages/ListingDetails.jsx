import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/Layout/Container';

const ListingDetails = () => {
  const { id } = useParams();

  return (
    <div data-easytag="id1-react/src/pages/ListingDetails.jsx">
      <Container className="py-10">
        <div data-easytag="id2-react/src/pages/ListingDetails.jsx" className="flex items-center justify-between mb-6">
          <h1 data-easytag="id3-react/src/pages/ListingDetails.jsx" className="text-2xl font-semibold text-brand">Объявление #{id}</h1>
          <Link data-easytag="id4-react/src/pages/ListingDetails.jsx" to="/catalog" className="text-sm text-brand hover:text-brand-accent">← Назад к каталогу</Link>
        </div>

        <div data-easytag="id5-react/src/pages/ListingDetails.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div data-easytag="id6-react/src/pages/ListingDetails.jsx" className="lg:col-span-2 space-y-3">
            <div data-easytag="id7-react/src/pages/ListingDetails.jsx" className="aspect-video w-full rounded bg-zinc-100" />
            <div data-easytag="id8-react/src/pages/ListingDetails.jsx" className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} data-easytag="id9-react/src/pages/ListingDetails.jsx" className="aspect-video rounded bg-zinc-100" />
              ))}
            </div>
          </div>
          <aside data-easytag="id10-react/src/pages/ListingDetails.jsx" className="space-y-4">
            <div data-easytag="id11-react/src/pages/ListingDetails.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <p data-easytag="id12-react/src/pages/ListingDetails.jsx" className="text-xl font-semibold text-brand">1 250 000 ₽</p>
              <p data-easytag="id13-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-600">Москва</p>
              <button data-easytag="id14-react/src/pages/ListingDetails.jsx" className="mt-4 h-10 w-full rounded bg-brand text-white text-sm font-medium hover:bg-brand/90">Связаться с продавцом</button>
            </div>
            <div data-easytag="id15-react/src/pages/ListingDetails.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <h2 data-easytag="id16-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand mb-2">Характеристики</h2>
              <ul data-easytag="id17-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700 space-y-1">
                <li data-easytag="id18-react/src/pages/ListingDetails.jsx">Марка: —</li>
                <li data-easytag="id19-react/src/pages/ListingDetails.jsx">Модель: —</li>
                <li data-easytag="id20-react/src/pages/ListingDetails.jsx">Год: —</li>
                <li data-easytag="id21-react/src/pages/ListingDetails.jsx">Пробег: —</li>
              </ul>
            </div>
          </aside>
        </div>

        <section data-easytag="id22-react/src/pages/ListingDetails.jsx" className="mt-8 rounded border border-zinc-200 bg-white p-4">
          <h3 data-easytag="id23-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand mb-2">Описание</h3>
          <p data-easytag="id24-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700">Текст описания будет здесь. Минималистичная, аккуратная карточка объявления.</p>
        </section>
      </Container>
    </div>
  );
};

export default ListingDetails;
