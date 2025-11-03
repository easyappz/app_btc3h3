import React, { useMemo, useState } from 'react';
import Container from '../components/Layout/Container';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '../api/auth';
import { getListing, updateListing, deleteListing } from '../api/listings';
import { listConversations, listMessages, sendMessage } from '../api/chat';

function SectionTitle({ children }) {
  return <h2 data-easytag="id100-react/src/pages/Profile.jsx" className="text-sm font-semibold text-brand mb-2">{children}</h2>;
}

const Profile = () => {
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'listings';
  });
  const qc = useQueryClient();

  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const me = meQuery.data || {};

  // Profile update
  const [form, setForm] = useState({ username: '', email: '', phone: '' });
  React.useEffect(() => {
    if (me.username && !form.username) setForm({ username: me.username || '', email: me.email || '', phone: me.phone || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.username]);

  const updateMut = useMutation({
    mutationFn: (payload) => updateMe(payload),
    onSuccess: (data) => {
      qc.setQueryData(['me'], data);
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Профиль обновлён' } });
        window.dispatchEvent(event);
      } catch (e) {}
    },
  });

  // My listings by ID helper (since schema has no dedicated endpoint)
  const [editId, setEditId] = useState('');
  const [editing, setEditing] = useState(null);
  const loadListingMut = useMutation({
    mutationFn: (id) => getListing(id),
    onSuccess: (data) => setEditing({ title: data.title || '', price: String(data.price || ''), description: data.description || '' }),
  });
  const saveListingMut = useMutation({
    mutationFn: (payload) => updateListing(payload.id, { ...payload.data }),
    onSuccess: () => {
      try { const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Объявление обновлено' } }); window.dispatchEvent(event); } catch (e) {}
    },
  });
  const deleteListingMut = useMutation({
    mutationFn: (id) => deleteListing(id),
    onSuccess: () => {
      setEditing(null);
      setEditId('');
      try { const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Объявление удалено' } }); window.dispatchEvent(event); } catch (e) {}
    },
  });

  // Messages
  const convQuery = useQuery({ queryKey: ['conversations'], queryFn: () => listConversations({ page: 1, page_size: 20 }) });
  const conversations = convQuery.data?.results || [];
  const [activeConvId, setActiveConvId] = useState(null);
  const messagesQuery = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => listMessages(activeConvId, { page: 1, page_size: 50 }),
    enabled: !!activeConvId,
  });
  const sendMut = useMutation({
    mutationFn: (payload) => sendMessage(payload.id, { text: payload.text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] });
    },
  });
  const [outgoing, setOutgoing] = useState('');

  return (
    <div data-easytag="id1-react/src/pages/Profile.jsx">
      <Container className="py-10 space-y-6">
        <div data-easytag="id2-react/src/pages/Profile.jsx" className="flex items-center justify-between">
          <h1 data-easytag="id3-react/src/pages/Profile.jsx" className="text-2xl font-semibold text-brand">Личный кабинет</h1>
          <div data-easytag="id4-react/src/pages/Profile.jsx" className="grid grid-cols-3 gap-2">
            <button data-easytag="id5-react/src/pages/Profile.jsx" onClick={() => setTab('listings')} className={`h-10 rounded text-sm font-medium ${tab==='listings'?'bg-brand text-white':'border border-zinc-300 hover:bg-zinc-50'}`}>Мои объявления</button>
            <button data-easytag="id6-react/src/pages/Profile.jsx" onClick={() => setTab('messages')} className={`h-10 rounded text-sm font-medium ${tab==='messages'?'bg-brand text-white':'border border-zinc-300 hover:bg-zinc-50'}`}>Сообщения</button>
            <button data-easytag="id7-react/src/pages/Profile.jsx" onClick={() => setTab('profile')} className={`h-10 rounded text-sm font-medium ${tab==='profile'?'bg-brand text-white':'border border-zinc-300 hover:bg-zinc-50'}`}>Профиль</button>
          </div>
        </div>

        {tab === 'listings' && (
          <section data-easytag="id8-react/src/pages/Profile.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div data-easytag="id9-react/src/pages/Profile.jsx" className="rounded border border-zinc-200 bg-white p-4 lg:col-span-3">
              <SectionTitle>Мои объявления</SectionTitle>
              <div data-easytag="id10-react/src/pages/Profile.jsx" className="text-sm text-zinc-600 mb-3">По схеме API нет отдельного списка моих объявлений. Вы можете указать ID объявления для редактирования/удаления.</div>
              <div data-easytag="id11-react/src/pages/Profile.jsx" className="flex items-center gap-2 mb-4">
                <input data-easytag="id12-react/src/pages/Profile.jsx" value={editId} onChange={(e) => setEditId(e.target.value)} placeholder="ID объявления" className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm w-40" />
                <button data-easytag="id13-react/src/pages/Profile.jsx" onClick={() => editId && loadListingMut.mutate(editId)} className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Загрузить</button>
              </div>

              {editing && (
                <div data-easytag="id14-react/src/pages/Profile.jsx" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label data-easytag="id15-react/src/pages/Profile.jsx" className="grid gap-1 text-sm">
                    <span data-easytag="id16-react/src/pages/Profile.jsx" className="text-zinc-700">Заголовок</span>
                    <input data-easytag="id17-react/src/pages/Profile.jsx" value={editing.title} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm" />
                  </label>
                  <label data-easytag="id18-react/src/pages/Profile.jsx" className="grid gap-1 text-sm">
                    <span data-easytag="id19-react/src/pages/Profile.jsx" className="text-zinc-700">Цена</span>
                    <input data-easytag="id20-react/src/pages/Profile.jsx" value={editing.price} onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm" />
                  </label>
                  <label data-easytag="id21-react/src/pages/Profile.jsx" className="md:col-span-2 grid gap-1 text-sm">
                    <span data-easytag="id22-react/src/pages/Profile.jsx" className="text-zinc-700">Описание</span>
                    <textarea data-easytag="id23-react/src/pages/Profile.jsx" rows={4} value={editing.description} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} className="rounded border border-zinc-300 bg-white p-3 text-sm" />
                  </label>
                  <div data-easytag="id24-react/src/pages/Profile.jsx" className="md:col-span-2 flex justify-end gap-2">
                    <button data-easytag="id25-react/src/pages/Profile.jsx" onClick={() => deleteListingMut.mutate(Number(editId))} className="h-10 rounded border border-red-300 bg-red-50 px-4 text-sm text-red-700 hover:bg-red-100">Удалить</button>
                    <button data-easytag="id26-react/src/pages/Profile.jsx" onClick={() => saveListingMut.mutate({ id: Number(editId), data: { title: editing.title, price: Number(editing.price), description: editing.description } })} className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Сохранить</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'messages' && (
          <section data-easytag="id27-react/src/pages/Profile.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div data-easytag="id28-react/src/pages/Profile.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <SectionTitle>Переписки</SectionTitle>
              <div data-easytag="id29-react/src/pages/Profile.jsx" className="grid gap-2">
                {conversations.map((c) => (
                  <button key={c.id} data-easytag={`id30-${c.id}-react/src/pages/Profile.jsx`} onClick={() => setActiveConvId(c.id)} className={`rounded border px-3 py-2 text-left text-sm ${activeConvId===c.id?'border-brand bg-brand/5':'border-zinc-200 hover:bg-zinc-50'}`}>
                    <div data-easytag="id31-react/src/pages/Profile.jsx" className="font-medium text-zinc-800">{c.listing?.title || 'Объявление'}</div>
                    <div data-easytag="id32-react/src/pages/Profile.jsx" className="text-xs text-zinc-600">{c.seller?.username} / {c.buyer?.username}</div>
                    {!!c.last_message && (
                      <div data-easytag="id33-react/src/pages/Profile.jsx" className="mt-1 text-xs text-zinc-700 truncate">{c.last_message?.author?.username}: {c.last_message?.text}</div>
                    )}
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div data-easytag="id34-react/src/pages/Profile.jsx" className="text-sm text-zinc-600">Переписок пока нет.</div>
                )}
              </div>
            </div>
            <div data-easytag="id35-react/src/pages/Profile.jsx" className="lg:col-span-2 rounded border border-zinc-200 bg-white p-4 flex flex-col">
              <SectionTitle>Сообщения</SectionTitle>
              {!activeConvId ? (
                <div data-easytag="id36-react/src/pages/Profile.jsx" className="text-sm text-zinc-600">Выберите переписку слева</div>
              ) : (
                <>
                  <div data-easytag="id37-react/src/pages/Profile.jsx" className="flex-1 overflow-auto rounded border border-zinc-200 p-3">
                    {(messagesQuery.data?.results || []).map((m) => (
                      <div key={m.id} data-easytag={`id38-${m.id}-react/src/pages/Profile.jsx`} className="mb-3">
                        <div data-easytag="id39-react/src/pages/Profile.jsx" className="text-xs text-zinc-500">{m.author?.username} • {new Date(m.created_at).toLocaleString('ru-RU')}</div>
                        <div data-easytag="id40-react/src/pages/Profile.jsx" className="text-sm text-zinc-800">{m.text}</div>
                      </div>
                    ))}
                    {(messagesQuery.data?.results || []).length === 0 && (
                      <div data-easytag="id41-react/src/pages/Profile.jsx" className="text-sm text-zinc-600">Сообщений пока нет.</div>
                    )}
                  </div>
                  <form data-easytag="id42-react/src/pages/Profile.jsx" onSubmit={(e) => { e.preventDefault(); if (!outgoing) return; sendMut.mutate({ id: activeConvId, text: outgoing }); setOutgoing(''); }} className="mt-3 flex items-center gap-2">
                    <input data-easytag="id43-react/src/pages/Profile.jsx" value={outgoing} onChange={(e) => setOutgoing(e.target.value)} placeholder="Сообщение" className="h-11 flex-1 rounded border border-zinc-300 bg-white px-3 text-sm" />
                    <button data-easytag="id44-react/src/pages/Profile.jsx" type="submit" className="h-11 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Отправить</button>
                  </form>
                </>
              )}
            </div>
          </section>
        )}

        {tab === 'profile' && (
          <section data-easytag="id45-react/src/pages/Profile.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div data-easytag="id46-react/src/pages/Profile.jsx" className="rounded border border-zinc-200 bg-white p-4">
              <SectionTitle>Профиль</SectionTitle>
              <div data-easytag="id47-react/src/pages/Profile.jsx" className="text-sm text-zinc-700">Имя пользователя: {me.username || '—'}</div>
              <div data-easytag="id48-react/src/pages/Profile.jsx" className="text-sm text-zinc-700">Email: {me.email || '—'}</div>
              <div data-easytag="id49-react/src/pages/Profile.jsx" className="text-sm text-zinc-700">Телефон: {me.phone || '—'}</div>
            </div>
            <div data-easytag="id50-react/src/pages/Profile.jsx" className="lg:col-span-2 rounded border border-zinc-200 bg-white p-4">
              <SectionTitle>Редактировать профиль</SectionTitle>
              <form data-easytag="id51-react/src/pages/Profile.jsx" onSubmit={(e) => { e.preventDefault(); updateMut.mutate({ username: form.username, email: form.email, phone: form.phone }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label data-easytag="id52-react/src/pages/Profile.jsx" className="grid gap-1 text-sm">
                  <span data-easytag="id53-react/src/pages/Profile.jsx" className="text-zinc-700">Имя пользователя</span>
                  <input data-easytag="id54-react/src/pages/Profile.jsx" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm" />
                </label>
                <label data-easytag="id55-react/src/pages/Profile.jsx" className="grid gap-1 text-sm">
                  <span data-easytag="id56-react/src/pages/Profile.jsx" className="text-zinc-700">Email</span>
                  <input data-easytag="id57-react/src/pages/Profile.jsx" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm" />
                </label>
                <label data-easytag="id58-react/src/pages/Profile.jsx" className="sm:col-span-2 grid gap-1 text-sm">
                  <span data-easytag="id59-react/src/pages/Profile.jsx" className="text-zinc-700">Телефон</span>
                  <input data-easytag="id60-react/src/pages/Profile.jsx" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="h-10 rounded border border-zinc-300 bg-white px-3 text-sm" />
                </label>
                <div data-easytag="id61-react/src/pages/Profile.jsx" className="sm:col-span-2 flex justify-end">
                  <button data-easytag="id62-react/src/pages/Profile.jsx" type="submit" className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Сохранить</button>
                </div>
              </form>
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default Profile;
