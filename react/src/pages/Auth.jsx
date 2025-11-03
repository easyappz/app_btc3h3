import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Container from '../components/Layout/Container';
import { login, register } from '../api/auth';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/profile';

  const loginMut = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: () => {
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Добро пожаловать!' } });
        window.dispatchEvent(event);
      } catch (e) {}
      navigate(from, { replace: true });
    },
  });

  const registerMut = useMutation({
    mutationFn: (payload) => register(payload),
    onSuccess: () => {
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Регистрация успешна!' } });
        window.dispatchEvent(event);
      } catch (e) {}
      navigate('/profile', { replace: true });
    },
  });

  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
  }, [mode]);

  function onSubmit(e) {
    e.preventDefault();
    if (mode === 'login') {
      const payload = {};
      if (username) payload.username = username;
      if (email) payload.email = email;
      payload.password = password;
      loginMut.mutate(payload);
    } else {
      registerMut.mutate({ username, email, password });
    }
  }

  return (
    <div data-easytag="id1-react/src/pages/Auth.jsx" className="">
      <Container className="py-12">
        <div data-easytag="id2-react/src/pages/Auth.jsx" className="mx-auto w-full max-w-md rounded border border-zinc-200 bg-white p-6">
          <div data-easytag="id3-react/src/pages/Auth.jsx" className="mb-6 grid grid-cols-2 gap-2">
            <button
              data-easytag="id4-react/src/pages/Auth.jsx"
              onClick={() => setMode('login')}
              className={`h-10 rounded text-sm font-medium ${mode === 'login' ? 'bg-brand text-white' : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}
            >
              Вход
            </button>
            <button
              data-easytag="id5-react/src/pages/Auth.jsx"
              onClick={() => setMode('register')}
              className={`h-10 rounded text-sm font-medium ${mode === 'register' ? 'bg-brand text-white' : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}
            >
              Регистрация
            </button>
          </div>

          <form data-easytag="id6-react/src/pages/Auth.jsx" onSubmit={onSubmit} className="grid gap-3">
            <div data-easytag="id7-react/src/pages/Auth.jsx" className="grid gap-1 text-sm">
              <label data-easytag="id8-react/src/pages/Auth.jsx" className="text-zinc-700">Имя пользователя</label>
              <input
                data-easytag="id9-react/src/pages/Auth.jsx"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'Можно оставить пустым, если вход по email' : 'Обязательное поле'}
                className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm"
              />
            </div>
            <div data-easytag="id10-react/src/pages/Auth.jsx" className="grid gap-1 text-sm">
              <label data-easytag="id11-react/src/pages/Auth.jsx" className="text-zinc-700">Email</label>
              <input
                data-easytag="id12-react/src/pages/Auth.jsx"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'Можно оставить пустым, если вход по логину' : 'Обязательное поле'}
                className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm"
              />
            </div>
            <div data-easytag="id13-react/src/pages/Auth.jsx" className="grid gap-1 text-sm">
              <label data-easytag="id14-react/src/pages/Auth.jsx" className="text-zinc-700">Пароль</label>
              <input
                data-easytag="id15-react/src/pages/Auth.jsx"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm"
              />
            </div>

            <button
              data-easytag="id16-react/src/pages/Auth.jsx"
              type="submit"
              className="mt-2 h-11 rounded bg-brand text-white text-sm font-medium hover:bg-brand/90"
              disabled={loginMut.isPending || registerMut.isPending}
            >
              {mode === 'login' ? (loginMut.isPending ? 'Входим...' : 'Войти') : (registerMut.isPending ? 'Регистрируем...' : 'Создать аккаунт')}
            </button>
            {(loginMut.isError || registerMut.isError) && (
              <div data-easytag="id17-react/src/pages/Auth.jsx" className="text-sm text-red-600">Ошибка. Проверьте введённые данные.</div>
            )}
          </form>
        </div>
      </Container>
    </div>
  );
};

export default Auth;
