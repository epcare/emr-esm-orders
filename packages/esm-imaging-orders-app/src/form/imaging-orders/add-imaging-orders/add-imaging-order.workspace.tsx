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
  launchWorkspace2,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import { TestTypeSearch } from './imaging-type-search';
import { ImagingOrderForm } from './imaging-order-form.component';
import styles from './add-imaging-order.scss';
import { type ImagingOrderBasketItem } from '../../../types';

interface AddImagingOrderWorkspaceProps extends DefaultWorkspaceProps {
  order?: ImagingOrderBasketItem;
}

export default function AddImagingOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
}: AddImagingOrderWorkspaceProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { patient, isLoading: isLoadingPatient } = usePatient();
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder);

  const handleCancel = () => {
    closeWorkspace();
  };

  const handleBack = () => {
    launchWorkspace2('order-basket', {});
  };

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && patient && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{getPatientName(patient)}</span>
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
            onClick={handleBack}>
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
      {!currentLabOrder ? (
        <TestTypeSearch openLabForm={setCurrentLabOrder} />
      ) : (
        <ImagingOrderForm
          initialOrder={currentLabOrder}
          closeWorkspace={handleCancel}
          closeWorkspaceWithSavedChanges={handleCancel}
          promptBeforeClosing={() => true}
        />
      )}
    </div>
  );
}
