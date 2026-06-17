import React, { useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import {
  age,
  formatDate,
  getPatientName,
  parseDate,
  useLayoutType,
  usePatient,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import { TestTypeSearch } from './procedures-type-search';
import { ProceduresOrderForm } from './procedures-order-form.component';
import styles from './add-procedures-order.scss';
import { type ProcedureOrderBasketItem } from '../../../types';

interface AddProceduresOrderWorkspaceProps extends DefaultWorkspaceProps {
  order?: ProcedureOrderBasketItem;
}

export default function AddProceduresOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
}: AddProceduresOrderWorkspaceProps) {
  const { t } = useTranslation();
  const { patient, isLoading: isLoadingPatient } = usePatient();
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder);

  const isTablet = useLayoutType() === 'tablet';

  const patientName = patient ? getPatientName(patient) : '';

  const handleCancel = () => {
    closeWorkspace();
  };

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && patient && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient.gender)} &middot; {age(patient.birthDate)} &middot;{' '}
            <span>
              {formatDate(parseDate(patient.birthDate), {
                mode: 'wide',
                time: false,
              })}
            </span>
          </span>
        </div>
      )}
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
      {!currentLabOrder ? (
        <TestTypeSearch openLabForm={setCurrentLabOrder} />
      ) : (
        <ProceduresOrderForm
          initialOrder={currentLabOrder}
          closeWorkspace={handleCancel}
          closeWorkspaceWithSavedChanges={handleCancel}
          promptBeforeClosing={() => true}
        />
      )}
    </div>
  );
}
