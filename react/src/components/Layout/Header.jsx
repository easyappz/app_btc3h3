import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Container from './Container';

const Header = () => {
  return (
    <header
      data-easytag="id1-react/src/components/Layout/Header.jsx"
      className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
    >
      <Container className="flex h-16 items-center justify-between">
        <div data-easytag="id2-react/src/components/Layout/Header.jsx" className="flex items-center gap-3">
          <Link
            data-easytag="id3-react/src/components/Layout/Header.jsx"
            to="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-brand hover:text-brand-accent transition-colors"
          >
            <span data-easytag="id4-react/src/components/Layout/Header.jsx" className="inline-block h-6 w-6 rounded bg-brand" />
            <span data-easytag="id5-react/src/components/Layout/Header.jsx">АвтоДоска</span>
          </Link>
        </div>
        <nav data-easytag="id6-react/src/components/Layout/Header.jsx" className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            data-easytag="id7-react/src/components/Layout/Header.jsx"
            to="/"
            className={({ isActive }) => `transition-colors hover:text-brand-accent ${isActive ? 'text-brand' : 'text-zinc-600'}`}
          >Главная</NavLink>
          <NavLink
            data-easytag="id8-react/src/components/Layout/Header.jsx"
            to="/catalog"
            className={({ isActive }) => `transition-colors hover:text-brand-accent ${isActive ? 'text-brand' : 'text-zinc-600'}`}
          >Каталог</NavLink>
          <NavLink
            data-easytag="id9-react/src/components/Layout/Header.jsx"
            to="/add"
            className={({ isActive }) => `transition-colors hover:text-brand-accent ${isActive ? 'text-brand' : 'text-zinc-600'}`}
          >Добавить</NavLink>
          <NavLink
            data-easytag="id10-react/src/components/Layout/Header.jsx"
            to="/profile"
            className={({ isActive }) => `transition-colors hover:text-brand-accent ${isActive ? 'text-brand' : 'text-zinc-600'}`}
          >Профиль</NavLink>
        </nav>
        <div data-easytag="id11-react/src/components/Layout/Header.jsx" className="md:hidden">
          <span data-easytag="id12-react/src/components/Layout/Header.jsx" className="inline-block h-6 w-6 rounded bg-zinc-800" />
        </div>
      </Container>
    </header>
  );
};

export default Header;
