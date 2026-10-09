import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ImagingOrders from './imaging-orders.component';

const Root: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/imaging-orders';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<ImagingOrders />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
