import React, { useCallback, useState } from 'react';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePatient, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { MedicalSupplyOrderForm } from './medical-supply-form.component';
import { MedicalSupplyTypeSearch } from './medical-supply-type-search';
import styles from './add-medical-supply-order.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';

interface AddMedicalSupplyOrderWorkspaceProps {
  order?: MedicalSupplyOrderBasketItem;
}

type AddMedicalSupplyOrderWorkspaceDefinition = Workspace2DefinitionProps<
  AddMedicalSupplyOrderWorkspaceProps,
  { patientUuid?: string; patient?: fhir.Patient }
>;

export default function AddMedicalSupplyOrderWorkspace({
  closeWorkspace,
  workspaceProps,
  windowProps,
}: AddMedicalSupplyOrderWorkspaceDefinition) {
  const initialOrder = workspaceProps?.order;
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { patient } = usePatient();

  const handleCancel = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  const handleCloseWorkspaceWithSavedChanges = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <Workspace2 title={t('addMedicalSupplyOrder', 'Add medical supply order')} hasUnsavedChanges={hasUnsavedChanges}>
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
          <MedicalSupplyTypeSearch openMedicalSupplyForm={setCurrentOrder} patient={patient} />
        ) : (
          <MedicalSupplyOrderForm
            initialOrder={currentOrder}
            closeWorkspace={handleCancel}
            closeWorkspaceWithSavedChanges={handleCloseWorkspaceWithSavedChanges}
            onDirtyChange={setHasUnsavedChanges}
            patient={patient}
          />
        )}
      </div>
    </Workspace2>
  );
}
