import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Procedure from './procedure.component';
import { basePath } from './constants';
import { WorkspaceContainer } from '@openmrs/esm-framework';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Procedure />} />
      </Routes>
      <WorkspaceContainer contextKey="procedure-orders" />
    </BrowserRouter>
  );
};

export default Root;
