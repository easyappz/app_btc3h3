import React from 'react';
import { Link } from 'react-router-dom';

function formatPrice(v) {
  if (v === undefined || v === null) return '—';
  try { return Number(v).toLocaleString('ru-RU'); } catch (e) { return String(v); }
}

const ListingCard = ({ item }) => {
  return (
    <div data-easytag="id1-react/src/components/cards/ListingCard.jsx" className="rounded border border-zinc-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      <Link data-easytag="id2-react/src/components/cards/ListingCard.jsx" to={`/listing/${item.id}`} className="block">
        <div data-easytag="id3-react/src/components/cards/ListingCard.jsx" className="aspect-video w-full bg-zinc-100" />
        <div data-easytag="id4-react/src/components/cards/ListingCard.jsx" className="p-3">
          <div data-easytag="id5-react/src/components/cards/ListingCard.jsx" className="flex items-center justify-between gap-2">
            <h3 data-easytag="id6-react/src/components/cards/ListingCard.jsx" className="text-sm font-semibold text-brand truncate">{item.title}</h3>
            <div data-easytag="id7-react/src/components/cards/ListingCard.jsx" className="text-sm font-medium text-zinc-900">{formatPrice(item.price)} ₽</div>
          </div>
          <p data-easytag="id8-react/src/components/cards/ListingCard.jsx" className="mt-1 text-xs text-zinc-600">
            {item.make} {item.car_model} · {item.year} · {item.mileage?.toLocaleString?.('ru-RU')} км
          </p>
          <p data-easytag="id9-react/src/components/cards/ListingCard.jsx" className="mt-1 text-[11px] text-zinc-500">{item.location}</p>
          <div data-easytag="id10-react/src/components/cards/ListingCard.jsx" className="mt-2 text-[11px]">
            <span data-easytag="id11-react/src/components/cards/ListingCard.jsx" className={`inline-flex items-center rounded px-2 py-0.5 border ${item.status === 'APPROVED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : item.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-red-200 text-red-700 bg-red-50'}`}>{item.status}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
