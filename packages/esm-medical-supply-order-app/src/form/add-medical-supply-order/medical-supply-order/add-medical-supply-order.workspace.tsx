import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { MedicalSupplyOrderForm } from './medical-supply-form.component';
import styles from './add-medical-supply-order.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';

interface AddMedicalSupplyOrderWorkspaceProps extends DefaultWorkspaceProps {
  order?: MedicalSupplyOrderBasketItem;
}

export default function AddMedicalSupplyOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
}: AddMedicalSupplyOrderWorkspaceProps) {
  const { t } = useTranslation();
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  const handleCancel = () => {
    closeWorkspace();
  };

  const handleClose = () => {
    launchWorkspace2('order-basket', {});
  };

  if (!currentOrder) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>{t('noOrderSelected', 'No order selected')}</p>
          <button onClick={handleClose}>{t('close', 'Close')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MedicalSupplyOrderForm
        initialOrder={currentOrder}
        closeWorkspace={handleClose}
        closeWorkspaceWithSavedChanges={handleClose}
        promptBeforeClosing={() => true}
      />
    </div>
  );
}
