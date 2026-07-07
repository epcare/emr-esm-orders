import React, { useState, useCallback } from 'react';
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
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { TestTypeSearch } from './procedures-type-search';
import { ProceduresOrderForm } from './procedures-order-form.component';
import styles from './add-procedures-order.scss';
import {
  type ProcedureOrderBasketItem,
  type OrderWorkspaceDefinitionProps,
  type BaseOrderWorkspaceProps,
  type BaseOrderWindowProps,
} from '../../../types';

/**
 * Workspace props for adding/editing procedure orders
 */
interface AddProceduresOrderWorkspaceProps extends Omit<BaseOrderWorkspaceProps, 'order'> {
  order?: ProcedureOrderBasketItem;
}

/**
 * Window props for patient context
 */
type AddProceduresOrderWindowProps = BaseOrderWindowProps;

/**
 * Combined workspace definition props
 */
type AddProceduresOrderWorkspaceDefinition = OrderWorkspaceDefinitionProps<
  AddProceduresOrderWorkspaceProps,
  AddProceduresOrderWindowProps
>;

/**
 * Add Procedures Order Workspace
 *
 * A standalone workspace for creating and editing procedure orders.
 * Patient context is received via windowProps, ensuring the workspace
 * can function outside the patient chart.
 */
export default function AddProceduresOrderWorkspace({
  closeWorkspace,
  workspaceProps,
  windowProps,
}: AddProceduresOrderWorkspaceDefinition) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Extract patient context from windowProps
  const patientUuid = windowProps?.patientUuid;
  const patientFromProps = windowProps?.patient;

  // Use usePatient hook only if patient not provided via props
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);

  // Use passed patient if available, otherwise use fetched patient
  const patientData = patientFromProps || patient;

  // Extract workspace props
  const initialOrder = workspaceProps?.order;
  const formContext = workspaceProps?.formContext ?? 'creating';

  const [currentProcedureOrder, setCurrentProcedureOrder] = useState<ProcedureOrderBasketItem | undefined>(
    initialOrder,
  );

  const patientName = patientData ? getPatientName(patientData) : '';

  const handleCancel = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  // Show loading state while patient data is being fetched
  if (!patientUuid && !patientData) {
    return null;
  }

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && patientData && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patientData.gender)} &middot; {age(patientData.birthDate)} &middot;{' '}
            <span>
              {formatDate(parseDate(patientData.birthDate), {
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
      {!currentProcedureOrder ? (
        <TestTypeSearch openProcedureForm={setCurrentProcedureOrder} />
      ) : (
        <ProceduresOrderForm
          initialOrder={currentProcedureOrder}
          closeWorkspace={handleCancel}
          closeWorkspaceWithSavedChanges={handleCancel}
          promptBeforeClosing={() => true}
        />
      )}
    </div>
  );
}
