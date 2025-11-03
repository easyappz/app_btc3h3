import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Container from '../components/Layout/Container';
import { getListing } from '../api/listings';
import { listSellerReviews, createReview, deleteReview } from '../api/reviews';
import { createConversation } from '../api/chat';
import { getMe } from '../api/auth';

function useAuthProfile() {
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  return useQuery({ queryKey: ['me'], queryFn: getMe, enabled: hasToken });
}

function Stars({ value }) {
  const v = Math.round(value || 0);
  const arr = [1, 2, 3, 4, 5];
  return (
    <div data-easytag="id100-react/src/pages/ListingDetails.jsx" className="text-amber-500 text-sm">
      {arr.map((i) => (
        <span key={i} data-easytag={`id101-${i}-react/src/pages/ListingDetails.jsx`}>{i <= v ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [messageOpen, setMessageOpen] = useState(false);
  const [firstMessage, setFirstMessage] = useState('Здравствуйте! Актуально ли объявление?');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const { data: listing, isLoading } = useQuery({ queryKey: ['listing', id], queryFn: () => getListing(id) });
  const sellerId = listing?.seller?.id;

  const { data: me } = useAuthProfile();
  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', sellerId],
    queryFn: () => listSellerReviews(sellerId, { page: 1, page_size: 10 }),
    enabled: !!sellerId,
  });

  const avgRating = useMemo(() => {
    const items = reviews?.results || [];
    if (!items.length) return 0;
    const sum = items.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / items.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews?.results]);

  const createConversationMut = useMutation({
    mutationFn: (payload) => createConversation(payload),
    onSuccess: (res) => {
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Сообщение отправлено' } });
        window.dispatchEvent(event);
      } catch (e) {}
      setMessageOpen(false);
      if (res?.conversation?.id) {
        navigate('/profile?tab=messages');
      }
    },
  });

  const createReviewMut = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      setReviewText('');
      setReviewRating(5);
      refetchReviews();
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Отзыв опубликован' } });
        window.dispatchEvent(event);
      } catch (e) {}
    },
  });

  const deleteReviewMut = useMutation({
    mutationFn: (rid) => deleteReview(rid),
    onSuccess: () => {
      refetchReviews();
    },
  });

  function openMessage() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: false, state: { from: { pathname: `/listing/${id}` } } });
      return;
    }
    setMessageOpen(true);
  }

  function submitFirstMessage() {
    if (!listing?.seller?.id) return;
    createConversationMut.mutate({ seller_id: listing.seller.id, listing_id: listing.id, text: firstMessage });
  }

  return (
    <div data-easytag="id1-react/src/pages/ListingDetails.jsx">
      <Container className="py-10">
        <div data-easytag="id2-react/src/pages/ListingDetails.jsx" className="flex items-center justify-between mb-6">
          <h1 data-easytag="id3-react/src/pages/ListingDetails.jsx" className="text-2xl font-semibold text-brand">{isLoading ? 'Загрузка...' : listing?.title || 'Объявление'}</h1>
          <Link data-easytag="id4-react/src/pages/ListingDetails.jsx" to="/catalog" className="text-sm text-brand hover:text-brand-accent">← Назад к каталогу</Link>
        </div>

        {isLoading ? (
          <div data-easytag="id5-react/src/pages/ListingDetails.jsx" className="grid place-items-center py-20 text-sm text-zinc-600">Загрузка...</div>
        ) : listing ? (
          <>
            <div data-easytag="id6-react/src/pages/ListingDetails.jsx" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div data-easytag="id7-react/src/pages/ListingDetails.jsx" className="lg:col-span-2 space-y-3">
                <div data-easytag="id8-react/src/pages/ListingDetails.jsx" className="aspect-video w-full rounded bg-zinc-100" />
                <div data-easytag="id9-react/src/pages/ListingDetails.jsx" className="grid grid-cols-4 gap-3">
                  {(listing.images || []).slice(0, 4).map((img) => (
                    <div key={img.id} data-easytag={`id10-${img.id}-react/src/pages/ListingDetails.jsx`} className="aspect-video rounded bg-zinc-100" />
                  ))}
                  {(!listing.images || listing.images.length === 0) && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} data-easytag={`id11-${i}-react/src/pages/ListingDetails.jsx`} className="aspect-video rounded bg-zinc-100" />
                  ))}
                </div>
              </div>
              <aside data-easytag="id12-react/src/pages/ListingDetails.jsx" className="space-y-4">
                <div data-easytag="id13-react/src/pages/ListingDetails.jsx" className="rounded border border-zinc-200 bg-white p-4">
                  <p data-easytag="id14-react/src/pages/ListingDetails.jsx" className="text-xl font-semibold text-brand">{Number(listing.price).toLocaleString('ru-RU')} ₽</p>
                  <p data-easytag="id15-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-600">{listing?.location?.name || 'Локация —'}</p>
                  <div data-easytag="id16-react/src/pages/ListingDetails.jsx" className="mt-3 flex items-center justify-between">
                    <div data-easytag="id17-react/src/pages/ListingDetails.jsx" className="text-sm">
                      <div data-easytag="id18-react/src/pages/ListingDetails.jsx" className="font-medium text-zinc-800">Продавец: {listing?.seller?.username}</div>
                      <div data-easytag="id19-react/src/pages/ListingDetails.jsx" className="flex items-center gap-2 text-xs text-zinc-600">
                        <Stars value={avgRating} />
                        <span data-easytag="id20-react/src/pages/ListingDetails.jsx">{(reviews?.results || []).length} отзыв(ов)</span>
                      </div>
                    </div>
                  </div>
                  <button data-easytag="id21-react/src/pages/ListingDetails.jsx" onClick={openMessage} className="mt-4 h-10 w-full rounded bg-brand text-white text-sm font-medium hover:bg-brand/90">Написать продавцу</button>
                </div>
                <div data-easytag="id22-react/src/pages/ListingDetails.jsx" className="rounded border border-zinc-200 bg-white p-4">
                  <h2 data-easytag="id23-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand mb-2">Характеристики</h2>
                  <ul data-easytag="id24-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700 space-y-1">
                    <li data-easytag="id25-react/src/pages/ListingDetails.jsx">Марка: {listing?.make?.name || '—'}</li>
                    <li data-easytag="id26-react/src/pages/ListingDetails.jsx">Модель: {listing?.car_model?.name || '—'}</li>
                    <li data-easytag="id27-react/src/pages/ListingDetails.jsx">Год: {listing?.year || '—'}</li>
                    <li data-easytag="id28-react/src/pages/ListingDetails.jsx">Пробег: {listing?.mileage?.toLocaleString?.('ru-RU')} км</li>
                    <li data-easytag="id29-react/src/pages/ListingDetails.jsx">Трансмиссия: {listing?.transmission}</li>
                    <li data-easytag="id30-react/src/pages/ListingDetails.jsx">Топливо: {listing?.fuel}</li>
                    <li data-easytag="id31-react/src/pages/ListingDetails.jsx">Кузов: {listing?.body}</li>
                    <li data-easytag="id32-react/src/pages/ListingDetails.jsx">Привод: {listing?.drive}</li>
                    <li data-easytag="id33-react/src/pages/ListingDetails.jsx">Состояние: {listing?.condition}</li>
                    <li data-easytag="id34-react/src/pages/ListingDetails.jsx">Цвет: {listing?.color}</li>
                    <li data-easytag="id35-react/src/pages/ListingDetails.jsx">Владельцев: {listing?.owners_count}</li>
                    <li data-easytag="id36-react/src/pages/ListingDetails.jsx">VIN: {listing?.vin || '—'}</li>
                  </ul>
                </div>
              </aside>
            </div>

            <section data-easytag="id37-react/src/pages/ListingDetails.jsx" className="mt-8 rounded border border-zinc-200 bg-white p-4">
              <h3 data-easytag="id38-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand mb-2">Описание</h3>
              <p data-easytag="id39-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700 whitespace-pre-line">{listing?.description || '—'}</p>
            </section>

            <section data-easytag="id40-react/src/pages/ListingDetails.jsx" className="mt-8 rounded border border-zinc-200 bg-white p-4">
              <div data-easytag="id41-react/src/pages/ListingDetails.jsx" className="flex items-center justify-between mb-3">
                <h3 data-easytag="id42-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand">Отзывы о продавце</h3>
                <div data-easytag="id43-react/src/pages/ListingDetails.jsx" className="text-xs text-zinc-600">Средняя оценка: {avgRating.toFixed(1)}</div>
              </div>
              <div data-easytag="id44-react/src/pages/ListingDetails.jsx" className="space-y-3">
                {(reviews?.results || []).map((r) => (
                  <div key={r.id} data-easytag={`id45-${r.id}-react/src/pages/ListingDetails.jsx`} className="rounded border border-zinc-200 p-3">
                    <div data-easytag="id46-react/src/pages/ListingDetails.jsx" className="flex items-center justify-between">
                      <div data-easytag="id47-react/src/pages/ListingDetails.jsx" className="text-sm font-medium text-zinc-800">{r.author?.username}</div>
                      <div data-easytag="id48-react/src/pages/ListingDetails.jsx" className="flex items-center gap-2 text-sm"><Stars value={r.rating} /><span data-easytag="id49-react/src/pages/ListingDetails.jsx" className="text-zinc-500">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span></div>
                    </div>
                    <div data-easytag="id50-react/src/pages/ListingDetails.jsx" className="mt-1 text-sm text-zinc-700">{r.text}</div>
                    {!!me?.id && me?.id === r.author?.id && (
                      <button data-easytag="id51-react/src/pages/ListingDetails.jsx" onClick={() => deleteReviewMut.mutate(r.id)} className="mt-2 text-xs text-red-600 hover:text-red-700">Удалить</button>
                    )}
                  </div>
                ))}
                {(!reviews || (reviews?.results || []).length === 0) && (
                  <div data-easytag="id52-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-600">Пока нет отзывов.</div>
                )}
              </div>

              <div data-easytag="id53-react/src/pages/ListingDetails.jsx" className="mt-4">
                {localStorage.getItem('token') ? (
                  <form data-easytag="id54-react/src/pages/ListingDetails.jsx" onSubmit={(e) => { e.preventDefault(); createReviewMut.mutate({ seller_id: listing?.seller?.id, listing_id: listing?.id, rating: Number(reviewRating), text: reviewText }); }} className="grid gap-2">
                    <div data-easytag="id55-react/src/pages/ListingDetails.jsx" className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <label data-easytag="id56-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700">Оценка</label>
                      <select data-easytag="id57-react/src/pages/ListingDetails.jsx" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="h-10 rounded border border-zinc-300 bg-white px-2 text-sm sm:col-span-3">
                        {[1,2,3,4,5].map((n) => (<option key={n} data-easytag={`id57o-${n}-react/src/pages/ListingDetails.jsx`} value={n}>{n}</option>))}
                      </select>
                    </div>
                    <div data-easytag="id58-react/src/pages/ListingDetails.jsx" className="grid gap-1">
                      <label data-easytag="id59-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-700">Текст отзыва</label>
                      <textarea data-easytag="id60-react/src/pages/ListingDetails.jsx" rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="rounded border border-zinc-300 bg-white p-3 text-sm" placeholder="Поделитесь впечатлениями"></textarea>
                    </div>
                    <div data-easytag="id61-react/src/pages/ListingDetails.jsx" className="flex justify-end">
                      <button data-easytag="id62-react/src/pages/ListingDetails.jsx" type="submit" className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Опубликовать отзыв</button>
                    </div>
                  </form>
                ) : (
                  <div data-easytag="id63-react/src/pages/ListingDetails.jsx" className="text-sm text-zinc-600">Чтобы оставить отзыв, <Link data-easytag="id64-react/src/pages/ListingDetails.jsx" to="/login" className="text-brand hover:text-brand-accent">войдите</Link>.</div>
                )}
              </div>
            </section>

            {messageOpen && (
              <div data-easytag="id65-react/src/pages/ListingDetails.jsx" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                <div data-easytag="id66-react/src/pages/ListingDetails.jsx" className="w-full max-w-md rounded border border-zinc-200 bg-white p-4">
                  <div data-easytag="id67-react/src/pages/ListingDetails.jsx" className="text-sm font-semibold text-brand">Первое сообщение продавцу</div>
                  <textarea data-easytag="id68-react/src/pages/ListingDetails.jsx" rows={4} value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} className="mt-3 w-full rounded border border-zinc-300 bg-white p-3 text-sm" />
                  <div data-easytag="id69-react/src/pages/ListingDetails.jsx" className="mt-3 flex items-center justify-end gap-2">
                    <button data-easytag="id70-react/src/pages/ListingDetails.jsx" onClick={() => setMessageOpen(false)} className="h-10 rounded border border-zinc-300 px-4 text-sm hover:bg-zinc-50">Отмена</button>
                    <button data-easytag="id71-react/src/pages/ListingDetails.jsx" onClick={submitFirstMessage} disabled={createConversationMut.isPending} className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">{createConversationMut.isPending ? 'Отправка...' : 'Отправить'}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div data-easytag="id72-react/src/pages/ListingDetails.jsx" className="py-20 text-center text-sm text-zinc-600">Объявление не найдено.</div>
        )}
      </Container>
    </div>
  );
};

export default ListingDetails;
