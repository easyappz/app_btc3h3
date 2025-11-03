import React from 'react';
import Container from '../components/Layout/Container';

const Field = ({ label, children }) => (
  <label data-easytag="id100-react/src/pages/AddListing.jsx" className="grid gap-1 text-sm">
    <span data-easytag="id101-react/src/pages/AddListing.jsx" className="text-zinc-700">{label}</span>
    {children}
  </label>
);

const AddListing = () => {
  return (
    <div data-easytag="id1-react/src/pages/AddListing.jsx">
      <Container className="py-10">
        <h1 data-easytag="id2-react/src/pages/AddListing.jsx" className="text-2xl font-semibold text-brand mb-6">Добавить объявление</h1>
        <form data-easytag="id3-react/src/pages/AddListing.jsx" className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded border border-zinc-200 bg-white p-4">
          <Field label="Заголовок">
            <input data-easytag="id4-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Например: Toyota Camry" />
          </Field>
          <Field label="Цена, ₽">
            <input data-easytag="id5-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="1250000" />
          </Field>
          <Field label="Марка">
            <input data-easytag="id6-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Марка" />
          </Field>
          <Field label="Модель">
            <input data-easytag="id7-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Модель" />
          </Field>
          <Field label="Год">
            <input data-easytag="id8-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Год" />
          </Field>
          <Field label="Пробег, км">
            <input data-easytag="id9-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Пробег" />
          </Field>
          <Field label="Кузов">
            <input data-easytag="id10-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Седан / Хэтчбек / ..." />
          </Field>
          <Field label="Трансмиссия">
            <input data-easytag="id11-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="АКПП / МКПП / ..." />
          </Field>
          <Field label="Тип топлива">
            <input data-easytag="id12-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Бензин / Дизель / Электро" />
          </Field>
          <Field label="Город">
            <input data-easytag="id13-react/src/pages/AddListing.jsx" className="h-11 rounded border border-zinc-300 bg-white px-3 text-sm" placeholder="Город" />
          </Field>
          <div data-easytag="id14-react/src/pages/AddListing.jsx" className="lg:col-span-2 grid gap-1 text-sm">
            <span data-easytag="id15-react/src/pages/AddListing.jsx" className="text-zinc-700">Описание</span>
            <textarea data-easytag="id16-react/src/pages/AddListing.jsx" rows="5" className="rounded border border-zinc-300 bg-white p-3 text-sm" placeholder="Опишите автомобиль"></textarea>
          </div>
          <div data-easytag="id17-react/src/pages/AddListing.jsx" className="lg:col-span-2">
            <div data-easytag="id18-react/src/pages/AddListing.jsx" className="aspect-video w-full rounded border-2 border-dashed border-zinc-300 bg-zinc-50 grid place-items-center text-sm text-zinc-600">Место для изображений</div>
          </div>
          <div data-easytag="id19-react/src/pages/AddListing.jsx" className="lg:col-span-2 flex justify-end gap-2">
            <button data-easytag="id20-react/src/pages/AddListing.jsx" type="button" className="h-10 rounded border border-zinc-300 px-4 text-sm text-zinc-700 hover:bg-zinc-50">Сохранить черновик</button>
            <button data-easytag="id21-react/src/pages/AddListing.jsx" type="button" className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Отправить на модерацию</button>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default AddListing;
