import React, { useState } from 'react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { MedicalSupplyOrderForm } from './medical-supply-form.component';
import { MedicalSupplyTypeSearch } from './medical-supply-type-search';
import styles from './add-medical-supply-order.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';

interface AddMedicalSupplyOrderWorkspaceProps extends DefaultWorkspaceProps {
  order?: MedicalSupplyOrderBasketItem;
}

export default function AddMedicalSupplyOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
}: AddMedicalSupplyOrderWorkspaceProps) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  const handleCancel = () => {
    closeWorkspace();
  };

  return (
    <div className={styles.container}>
      {!currentOrder ? (
        <MedicalSupplyTypeSearch openMedicalSupplyForm={setCurrentOrder} />
      ) : (
        <MedicalSupplyOrderForm
          initialOrder={currentOrder}
          closeWorkspace={handleCancel}
          closeWorkspaceWithSavedChanges={handleCancel}
          promptBeforeClosing={() => true}
        />
      )}
    </div>
  );
}
