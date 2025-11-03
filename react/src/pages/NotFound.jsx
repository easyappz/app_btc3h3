import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Layout/Container';

const NotFound = () => {
  return (
    <div data-easytag="id1-react/src/pages/NotFound.jsx" className="">
      <Container className="py-20 text-center">
        <div data-easytag="id2-react/src/pages/NotFound.jsx" className="mx-auto max-w-md">
          <h1 data-easytag="id3-react/src/pages/NotFound.jsx" className="text-6xl font-bold text-brand">404</h1>
          <p data-easytag="id4-react/src/pages/NotFound.jsx" className="mt-2 text-zinc-600">Страница не найдена.</p>
          <Link data-easytag="id5-react/src/pages/NotFound.jsx" to="/" className="mt-6 inline-block rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90">На главную</Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
