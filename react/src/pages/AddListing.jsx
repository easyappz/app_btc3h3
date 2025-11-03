import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Container from '../components/Layout/Container';
import { createListing, uploadImage } from '../api/listings';

const Field = ({ label, children }) => (
  <label data-easytag="id100-react/src/pages/AddListing.jsx" className="grid gap-1 text-sm">
    <span data-easytag="id101-react/src/pages/AddListing.jsx" className="text-zinc-700">{label}</span>
    {children}
  </label>
);

const AddListing = () => {
  const [form, setForm] = useState({
    make: '',
    car_model: '',
    year: '',
    price: '',
    mileage: '',
    transmission: 'AUTO',
    fuel: 'GASOLINE',
    body: 'SEDAN',
    drive: 'FWD',
    condition: 'USED',
    color: '',
    location: '',
    owners_count: '1',
    vin: '',
    title: '',
    description: '',
  });
  const [files, setFiles] = useState([]);

  function setValue(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const createMut = useMutation({
    mutationFn: (payload) => createListing(payload),
    onSuccess: async (data) => {
      try {
        const event = new CustomEvent('easyappz:notify', { detail: { type: 'info', message: 'Объявление отправлено на модерацию' } });
        window.dispatchEvent(event);
      } catch (e) {}
      // Upload images sequentially (if any)
      try {
        for (let i = 0; i < files.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await uploadImage(data.id, files[i], i);
        }
      } catch (e) {
        // ignore image errors
      }
    },
  });

  function onSubmit(e) {
    e.preventDefault();
    // IMPORTANT: make, car_model, location must be integer IDs according to API schema
    const payload = {
      make: Number(form.make),
      car_model: Number(form.car_model),
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      transmission: form.transmission,
      fuel: form.fuel,
      body: form.body,
      drive: form.drive,
      condition: form.condition,
      color: form.color,
      location: Number(form.location),
      owners_count: Number(form.owners_count),
      vin: form.vin || undefined,
      title: form.title,
      description: form.description || '',
    };
    createMut.mutate(payload);
  }

  return (
    <div data-easytag="id1-react/src/pages/AddListing.jsx">
      <Container className="py-10">
        <h1 data-easytag="id2-react/src/pages/AddListing.jsx" className="text-2xl font-semibold text-brand mb-6">Добавить объявление</h1>
        <form data-easytag="id3-react/src/pages/AddListing.jsx" onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded border border-zinc-200 bg-white p-4">
          <Field label="Заголовок">
            <input data-easytag="id4-react/src/pages/AddListing.jsx" value={form.title} onChange={(e) => setValue('title', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Например: Toyota Camry" />
          </Field>
          <Field label="Цена, ₽">
            <input data-easytag="id5-react/src/pages/AddListing.jsx" value={form.price} onChange={(e) => setValue('price', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="1250000" />
          </Field>
          <Field label="ID марки (целое число)">
            <input data-easytag="id6-react/src/pages/AddListing.jsx" value={form.make} onChange={(e) => setValue('make', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Например: 1" />
          </Field>
          <Field label="ID модели (целое число)">
            <input data-easytag="id7-react/src/pages/AddListing.jsx" value={form.car_model} onChange={(e) => setValue('car_model', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Например: 10" />
          </Field>
          <Field label="Год">
            <input data-easytag="id8-react/src/pages/AddListing.jsx" value={form.year} onChange={(e) => setValue('year', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Год" />
          </Field>
          <Field label="Пробег, км">
            <input data-easytag="id9-react/src/pages/AddListing.jsx" value={form.mileage} onChange={(e) => setValue('mileage', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Пробег" />
          </Field>
          <Field label="Кузов">
            <select data-easytag="id10-react/src/pages/AddListing.jsx" value={form.body} onChange={(e) => setValue('body', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm">
              {['SEDAN','HATCHBACK','SUV','COUPE','WAGON','PICKUP','VAN'].map((o) => (<option key={o} data-easytag={`id10o-${o}-react/src/pages/AddListing.jsx`} value={o}>{o}</option>))}
            </select>
          </Field>
          <Field label="Трансмиссия">
            <select data-easytag="id11-react/src/pages/AddListing.jsx" value={form.transmission} onChange={(e) => setValue('transmission', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm">
              {['MANUAL','AUTO','CVT','ROBOT'].map((o) => (<option key={o} data-easytag={`id11o-${o}-react/src/pages/AddListing.jsx`} value={o}>{o}</option>))}
            </select>
          </Field>
          <Field label="Тип топлива">
            <select data-easytag="id12-react/src/pages/AddListing.jsx" value={form.fuel} onChange={(e) => setValue('fuel', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm">
              {['GASOLINE','DIESEL','HYBRID','ELECTRIC'].map((o) => (<option key={o} data-easytag={`id12o-${o}-react/src/pages/AddListing.jsx`} value={o}>{o}</option>))}
            </select>
          </Field>
          <Field label="Привод">
            <select data-easytag="id13-react/src/pages/AddListing.jsx" value={form.drive} onChange={(e) => setValue('drive', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm">
              {['FWD','RWD','AWD'].map((o) => (<option key={o} data-easytag={`id13o-${o}-react/src/pages/AddListing.jsx`} value={o}>{o}</option>))}
            </select>
          </Field>
          <Field label="Состояние">
            <select data-easytag="id14-react/src/pages/AddListing.jsx" value={form.condition} onChange={(e) => setValue('condition', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm">
              {['NEW','USED'].map((o) => (<option key={o} data-easytag={`id14o-${o}-react/src/pages/AddListing.jsx`} value={o}>{o}</option>))}
            </select>
          </Field>
          <Field label="Цвет">
            <input data-easytag="id15-react/src/pages/AddListing.jsx" value={form.color} onChange={(e) => setValue('color', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Цвет" />
          </Field>
          <Field label="ID локации (целое число)">
            <input data-easytag="id16-react/src/pages/AddListing.jsx" value={form.location} onChange={(e) => setValue('location', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Например: 5" />
          </Field>
          <Field label="Кол-во владельцев">
            <input data-easytag="id17-react/src/pages/AddListing.jsx" value={form.owners_count} onChange={(e) => setValue('owners_count', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="1" />
          </Field>
          <Field label="VIN">
            <input data-easytag="id18-react/src/pages/AddListing.jsx" value={form.vin} onChange={(e) => setValue('vin', e.target.value)} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Опционально" />
          </Field>
          <div data-easytag="id19-react/src/pages/AddListing.jsx" className="lg:col-span-2 grid gap-1 text-sm">
            <span data-easytag="id20-react/src/pages/AddListing.jsx" className="text-zinc-700">Описание</span>
            <textarea data-easytag="id21-react/src/pages/AddListing.jsx" rows="5" value={form.description} onChange={(e) => setValue('description', e.target.value)} className="rounded border border-zinc-300 bg-white p-3 text-sm" placeholder="Опишите автомобиль"></textarea>
          </div>
          <div data-easytag="id22-react/src/pages/AddListing.jsx" className="lg:col-span-2 grid gap-2">
            <div data-easytag="id23-react/src/pages/AddListing.jsx" className="text-sm text-zinc-700">Изображения (опционально)</div>
            <input data-easytag="id24-react/src/pages/AddListing.jsx" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" />
            <div data-easytag="id25-react/src/pages/AddListing.jsx" className="text-xs text-zinc-500">Подсказка: после отправки объявление попадёт на модерацию. Изображения загрузятся автоматически.</div>
          </div>
          <div data-easytag="id26-react/src/pages/AddListing.jsx" className="lg:col-span-2 flex justify-end gap-2">
            <button data-easytag="id27-react/src/pages/AddListing.jsx" type="button" className="h-10 rounded border border-zinc-300 px-4 text-sm text-zinc-700 hover:bg-zinc-50">Сохранить черновик</button>
            <button data-easytag="id28-react/src/pages/AddListing.jsx" type="submit" className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90" disabled={createMut.isPending}>{createMut.isPending ? 'Отправка...' : 'Отправить на модерацию'}</button>
          </div>
          <div data-easytag="id29-react/src/pages/AddListing.jsx" className="lg:col-span-2 text-xs text-zinc-600">Важно: поля Марка, Модель и Локация принимают числовые идентификаторы из справочников сервера.</div>
        </form>
      </Container>
    </div>
  );
};

export default AddListing;
