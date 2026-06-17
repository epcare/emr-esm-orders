import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
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
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  const handleCancel = () => {
    closeWorkspace();
  };

  return (
    <div className={styles.container}>
      {!isTablet && (
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={handleCancel}>
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
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
