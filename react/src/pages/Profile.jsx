import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Layout/Container';

const Profile = () => {
  return (
    <div data-easytag="id1-react/src/pages/Profile.jsx">
      <Container className="py-10 space-y-6">
        <div data-easytag="id2-react/src/pages/Profile.jsx" className="flex items-center justify-between">
          <h1 data-easytag="id3-react/src/pages/Profile.jsx" className="text-2xl font-semibold text-brand">Личный кабинет</h1>
          <Link data-easytag="id4-react/src/pages/Profile.jsx" to="/add" className="h-10 inline-flex items-center rounded bg-brand px-4 text-white text-sm font-medium hover:bg-brand/90">Добавить объявление</Link>
        </div>

        <section data-easytag="id5-react/src/pages/Profile.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div data-easytag="id6-react/src/pages/Profile.jsx" className="rounded border border-zinc-200 bg-white p-4">
            <h2 data-easytag="id7-react/src/pages/Profile.jsx" className="text-sm font-semibold text-brand mb-2">Профиль</h2>
            <p data-easytag="id8-react/src/pages/Profile.jsx" className="text-sm text-zinc-700">Имя пользователя: —</p>
            <p data-easytag="id9-react/src/pages/Profile.jsx" className="text-sm text-zinc-700">Email: —</p>
          </div>
          <div data-easytag="id10-react/src/pages/Profile.jsx" className="lg:col-span-2 rounded border border-zinc-200 bg-white p-4">
            <h2 data-easytag="id11-react/src/pages/Profile.jsx" className="text-sm font-semibold text-brand mb-3">Мои объявления</h2>
            <div data-easytag="id12-react/src/pages/Profile.jsx" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} data-easytag="id13-react/src/pages/Profile.jsx" className="rounded border border-zinc-200 bg-white p-3">
                  <div data-easytag="id14-react/src/pages/Profile.jsx" className="aspect-video w-full rounded bg-zinc-100" />
                  <div data-easytag="id15-react/src/pages/Profile.jsx" className="mt-2 flex items-center justify-between">
                    <p data-easytag="id16-react/src/pages/Profile.jsx" className="text-sm text-brand">Объявление #{i + 1}</p>
                    <div data-easytag="id17-react/src/pages/Profile.jsx" className="flex items-center gap-2">
                      <button data-easytag="id18-react/src/pages/Profile.jsx" className="text-xs text-brand hover:text-brand-accent">Редактировать</button>
                      <button data-easytag="id19-react/src/pages/Profile.jsx" className="text-xs text-red-600 hover:text-red-700">Удалить</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Profile;
