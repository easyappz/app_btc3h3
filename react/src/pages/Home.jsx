import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/Layout/Container';

const Home = () => {
  const navigate = useNavigate();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  function goSearch() {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (yearMin) params.set('year_min', yearMin);
    if (priceMax) params.set('price_max', priceMax);
    navigate(`/catalog?${params.toString()}`);
  }

  return (
    <div data-easytag="id1-react/src/pages/Home.jsx" className="">
      <section data-easytag="id2-react/src/pages/Home.jsx" className="bg-white">
        <Container className="py-16">
          <h1 data-easytag="id3-react/src/pages/Home.jsx" className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand mb-4">Найдите идеальный автомобиль</h1>
          <p data-easytag="id4-react/src/pages/Home.jsx" className="text-zinc-600 max-w-2xl mb-8">Поиск и покупка авто без лишнего шума. Фильтры по ключевым параметрам и удобная подача объявлений.</p>

          <form data-easytag="id5-react/src/pages/Home.jsx" onSubmit={(e) => { e.preventDefault(); goSearch(); }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input data-easytag="id6-react/src/pages/Home.jsx" value={make} onChange={(e) => setMake(e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm focus:border-sky-400" placeholder="Марка" />
            <input data-easytag="id7-react/src/pages/Home.jsx" value={model} onChange={(e) => setModel(e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm focus:border-sky-400" placeholder="Модель" />
            <input data-easytag="id8-react/src/pages/Home.jsx" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm focus:border-sky-400" placeholder="Год от" />
            <input data-easytag="id9-react/src/pages/Home.jsx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm focus:border-sky-400" placeholder="Цена до" />
            <button data-easytag="id10-react/src/pages/Home.jsx" type="submit" className="h-11 rounded bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Искать</button>
          </form>

          <div data-easytag="id11-react/src/pages/Home.jsx" className="mt-10 flex items-center gap-4">
            <Link data-easytag="id12-react/src/pages/Home.jsx" to="/catalog" className="text-sm font-medium text-brand hover:text-brand-accent transition-colors">Перейти в каталог →</Link>
            <Link data-easytag="id13-react/src/pages/Home.jsx" to="/add" className="inline-flex h-10 items-center rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Подать объявление</Link>
          </div>
        </Container>
      </section>

      <section data-easytag="id14-react/src/pages/Home.jsx" className="">
        <Container className="py-12">
          <div data-easytag="id15-react/src/pages/Home.jsx" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div data-easytag="id16-react/src/pages/Home.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <div data-easytag="id17-react/src/pages/Home.jsx" className="text-lg font-semibold text-brand">Прозрачность</div>
              <p data-easytag="id18-react/src/pages/Home.jsx" className="mt-1 text-sm text-zinc-600">Честные объявления и понятные статусы модерации.</p>
            </div>
            <div data-easytag="id19-react/src/pages/Home.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <div data-easytag="id20-react/src/pages/Home.jsx" className="text-lg font-semibold text-brand">Удобство</div>
              <p data-easytag="id21-react/src/pages/Home.jsx" className="mt-1 text-sm text-zinc-600">Минималистичный интерфейс, быстрый поиск и чат.</p>
            </div>
            <div data-easytag="id22-react/src/pages/Home.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <div data-easytag="id23-react/src/pages/Home.jsx" className="text-lg font-semibold text-brand">Поддержка</div>
              <p data-easytag="id24-react/src/pages/Home.jsx" className="mt-1 text-sm text-zinc-600">Отзывы и рейтинг продавцов для уверенной сделки.</p>
            </div>
          </div>
        </Container>
      </section>

      <section data-easytag="id25-react/src/pages/Home.jsx" className="">
        <Container className="py-12">
          <div data-easytag="id26-react/src/pages/Home.jsx" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} data-easytag="id27-react/src/pages/Home.jsx" className="rounded border border-zinc-200 bg-white p-3">
                <div data-easytag="id28-react/src/pages/Home.jsx" className="aspect-video w-full rounded bg-zinc-100" />
                <div data-easytag="id29-react/src/pages/Home.jsx" className="mt-3 flex items-center justify-between">
                  <div data-easytag="id30-react/src/pages/Home.jsx" className="">
                    <h3 data-easytag="id31-react/src/pages/Home.jsx" className="text-sm font-semibold text-brand">Автомобиль — {i + 1}</h3>
                    <p data-easytag="id32-react/src/pages/Home.jsx" className="text-xs text-zinc-600">Краткое описание</p>
                  </div>
                  <Link data-easytag="id33-react/src/pages/Home.jsx" to="/catalog" className="text-xs text-brand hover:text-brand-accent">Смотреть</Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
