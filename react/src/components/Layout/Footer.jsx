import React from 'react';
import Container from './Container';

const Footer = () => {
  return (
    <footer
      data-easytag="id1-react/src/components/Layout/Footer.jsx"
      className="border-t border-zinc-200 bg-white"
    >
      <Container className="py-8">
        <div data-easytag="id2-react/src/components/Layout/Footer.jsx" className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p data-easytag="id3-react/src/components/Layout/Footer.jsx" className="text-sm text-zinc-600">© {new Date().getFullYear()} АвтоДоска. Все права защищены.</p>
          <div data-easytag="id4-react/src/components/Layout/Footer.jsx" className="text-sm text-zinc-600">Минималистичный сервис объявлений о продаже автомобилей.</div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
