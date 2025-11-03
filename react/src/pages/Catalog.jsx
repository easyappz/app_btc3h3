import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/Layout/Container';
import { listListings } from '../api/listings';
import ListingCard from '../components/cards/ListingCard';

const MAKES = [
  { value: '', label: 'Все марки' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes', label: 'Mercedes' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Audi', label: 'Audi' },
];

const MODELS = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5'],
  Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE'],
  Volkswagen: ['Polo', 'Golf', 'Tiguan', 'Passat'],
  Audi: ['A3', 'A4', 'Q3', 'Q5'],
};

const TRANSMISSIONS = ['', 'MANUAL', 'AUTO', 'CVT', 'ROBOT'];
const FUELS = ['', 'GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const BODIES = ['', 'SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'WAGON', 'PICKUP', 'VAN'];
const DRIVES = ['', 'FWD', 'RWD', 'AWD'];
const CONDITIONS = ['', 'NEW', 'USED'];
const SORTS = [
  { value: 'created_desc', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'year_desc', label: 'Сначала новые года' },
];

function useParamState() {
  const [params, setParams] = useSearchParams();

  function set(name, value) {
    const next = new URLSearchParams(params);
    if (value === undefined || value === null || value === '') next.delete(name); else next.set(name, String(value));
    // Reset page on any filter change
    if (name !== 'page') next.set('page', '1');
    setParams(next, { replace: true });
  }

  function reset() {
    const preserved = new URLSearchParams();
    setParams(preserved, { replace: true });
  }

  function getAll() {
    const out = {};
    params.forEach((v, k) => { out[k] = v; });
    return out;
  }

  return { params, set, reset, getAll };
}

function Paginator({ count, page, pageSize, onPage }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div data-easytag="id100-react/src/pages/Catalog.jsx" className="flex items-center justify-center gap-2">
      <button data-easytag="id101-react/src/pages/Catalog.jsx" onClick={() => onPage(Math.max(1, current - 1))} className="h-9 rounded border border-zinc-300 px-3 text-sm hover:bg-zinc-50" disabled={current === 1}>Назад</button>
      {pages.map((p) => (
        <button key={p} data-easytag={`id102-${p}-react/src/pages/Catalog.jsx`} onClick={() => onPage(p)} className={`h-9 rounded border px-3 text-sm ${p === current ? 'bg-brand text-white border-brand' : 'border-zinc-300 hover:bg-zinc-50'}`}>{p}</button>
      ))}
      <button data-easytag="id103-react/src/pages/Catalog.jsx" onClick={() => onPage(Math.min(totalPages, current + 1))} className="h-9 rounded border border-zinc-300 px-3 text-sm hover:bg-zinc-50" disabled={current === totalPages}>Вперёд</button>
    </div>
  );
}

const Catalog = () => {
  const { params, set, reset, getAll } = useParamState();

  const page = Number(params.get('page') || '1');
  const pageSize = Number(params.get('page_size') || '12');

  const selectedMake = params.get('make') || '';
  const modelOptions = useMemo(() => (selectedMake && MODELS[selectedMake] ? MODELS[selectedMake] : []), [selectedMake]);

  const { data, isLoading } = useQuery({
    queryKey: ['listings', getAll()],
    queryFn: () => listListings(Object.assign({}, getAll(), { page, page_size: pageSize })),
    keepPreviousData: true,
  });

  useEffect(() => {
    // Ensure default sort
    if (!params.get('sort')) set('sort', 'created_desc');
    // Ensure default page_size
    if (!params.get('page_size')) set('page_size', '12');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = data?.results || [];
  const count = data?.count || 0;

  return (
    <div data-easytag="id1-react/src/pages/Catalog.jsx">
      <Container className="py-10">
        <div data-easytag="id2-react/src/pages/Catalog.jsx" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div data-easytag="id3-react/src/pages/Catalog.jsx">
            <h1 data-easytag="id4-react/src/pages/Catalog.jsx" className="text-2xl font-semibold text-brand">Каталог объявлений</h1>
            <p data-easytag="id5-react/src/pages/Catalog.jsx" className="text-sm text-zinc-600">Используйте фильтры, чтобы сузить поиск.</p>
          </div>
          <div data-easytag="id6-react/src/pages/Catalog.jsx" className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            <select data-easytag="id7-react/src/pages/Catalog.jsx" value={selectedMake} onChange={(e) => { set('make', e.target.value); set('model', ''); }} className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              {MAKES.map((m) => (
                <option key={m.label} data-easytag={`id7o-${m.label}-react/src/pages/Catalog.jsx`} value={m.value}>{m.label || 'Все марки'}</option>
              ))}
            </select>
            <select data-easytag="id9-react/src/pages/Catalog.jsx" value={params.get('model') || ''} onChange={(e) => set('model', e.target.value)} className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              <option data-easytag="id9o0-react/src/pages/Catalog.jsx" value="">Модель</option>
              {modelOptions.map((m) => (
                <option key={m} data-easytag={`id9o-${m}-react/src/pages/Catalog.jsx`} value={m}>{m}</option>
              ))}
            </select>
            <select data-easytag="id11-react/src/pages/Catalog.jsx" value={params.get('sort') || 'created_desc'} onChange={(e) => set('sort', e.target.value)} className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm">
              {SORTS.map((s) => (
                <option key={s.value} data-easytag={`id11o-${s.value}-react/src/pages/Catalog.jsx`} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button data-easytag="id13-react/src/pages/Catalog.jsx" onClick={() => reset()} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm hover:bg-zinc-50">Сбросить</button>
          </div>
        </div>

        <form data-easytag="id14-react/src/pages/Catalog.jsx" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          <input data-easytag="id15-react/src/pages/Catalog.jsx" placeholder="Цена от" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('price_min') || ''} onChange={(e) => set('price_min', e.target.value)} />
          <input data-easytag="id16-react/src/pages/Catalog.jsx" placeholder="Цена до" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('price_max') || ''} onChange={(e) => set('price_max', e.target.value)} />
          <input data-easytag="id17-react/src/pages/Catalog.jsx" placeholder="Год от" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('year_min') || ''} onChange={(e) => set('year_min', e.target.value)} />
          <input data-easytag="id18-react/src/pages/Catalog.jsx" placeholder="Год до" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('year_max') || ''} onChange={(e) => set('year_max', e.target.value)} />
          <input data-easytag="id19-react/src/pages/Catalog.jsx" placeholder="Пробег до" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('mileage_max') || ''} onChange={(e) => set('mileage_max', e.target.value)} />
          <input data-easytag="id20-react/src/pages/Catalog.jsx" placeholder="Цвет" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('color') || ''} onChange={(e) => set('color', e.target.value)} />
          <select data-easytag="id21-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('transmission') || ''} onChange={(e) => set('transmission', e.target.value)}>
            {TRANSMISSIONS.map((t) => (<option key={t || 'any'} data-easytag={`id21o-${t || 'any'}-react/src/pages/Catalog.jsx`} value={t}>{t || 'Любая трансмиссия'}</option>))}
          </select>
          <select data-easytag="id22-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('fuel') || ''} onChange={(e) => set('fuel', e.target.value)}>
            {FUELS.map((t) => (<option key={t || 'any'} data-easytag={`id22o-${t || 'any'}-react/src/pages/Catalog.jsx`} value={t}>{t || 'Любое топливо'}</option>))}
          </select>
          <select data-easytag="id23-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('body') || ''} onChange={(e) => set('body', e.target.value)}>
            {BODIES.map((t) => (<option key={t || 'any'} data-easytag={`id23o-${t || 'any'}-react/src/pages/Catalog.jsx`} value={t}>{t || 'Любой кузов'}</option>))}
          </select>
          <select data-easytag="id24-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('drive') || ''} onChange={(e) => set('drive', e.target.value)}>
            {DRIVES.map((t) => (<option key={t || 'any'} data-easytag={`id24o-${t || 'any'}-react/src/pages/Catalog.jsx`} value={t}>{t || 'Любой привод'}</option>))}
          </select>
          <select data-easytag="id25-react/src/pages/Catalog.jsx" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('condition') || ''} onChange={(e) => set('condition', e.target.value)}>
            {CONDITIONS.map((t) => (<option key={t || 'any'} data-easytag={`id25o-${t || 'any'}-react/src/pages/Catalog.jsx`} value={t}>{t || 'Любое состояние'}</option>))}
          </select>
          <input data-easytag="id26-react/src/pages/Catalog.jsx" placeholder="Локация" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('location') || ''} onChange={(e) => set('location', e.target.value)} />
          <input data-easytag="id27-react/src/pages/Catalog.jsx" placeholder="Макс. владельцев" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm" value={params.get('owners_count_max') || ''} onChange={(e) => set('owners_count_max', e.target.value)} />
          <input data-easytag="id28-react/src/pages/Catalog.jsx" placeholder="Поиск (текст)" className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm col-span-2" value={params.get('q') || ''} onChange={(e) => set('q', e.target.value)} />
        </form>

        <div data-easytag="id29-react/src/pages/Catalog.jsx" className="min-h-[140px]">
          {isLoading ? (
            <div data-easytag="id30-react/src/pages/Catalog.jsx" className="grid place-items-center py-10 text-sm text-zinc-600">Загрузка...</div>
          ) : (
            <div data-easytag="id31-react/src/pages/Catalog.jsx" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <div data-easytag="id32-react/src/pages/Catalog.jsx" className="mt-8">
          <Paginator
            count={count}
            page={page}
            pageSize={pageSize}
            onPage={(p) => set('page', String(p))}
          />
        </div>
      </Container>
    </div>
  );
};

export default Catalog;
