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
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { TestTypeSearch } from './imaging-type-search';
import { ImagingOrderForm } from './imaging-order-form.component';
import styles from './add-imaging-order.scss';
import {
  type ImagingOrderBasketItem,
  type OrderWorkspaceDefinitionProps,
  type BaseOrderWorkspaceProps,
  type BaseOrderWindowProps,
} from '../../../types';

/**
 * Workspace props for adding/editing imaging orders
 */
interface AddImagingOrderWorkspaceProps extends Omit<BaseOrderWorkspaceProps, 'order'> {
  order?: ImagingOrderBasketItem;
}

/**
 * Window props for patient context
 */
type AddImagingOrderWindowProps = BaseOrderWindowProps;

/**
 * Combined workspace definition props
 */
type AddImagingOrderWorkspaceDefinition = OrderWorkspaceDefinitionProps<
  AddImagingOrderWorkspaceProps,
  AddImagingOrderWindowProps
>;

/**
 * Add Imaging Order Workspace
 *
 * A standalone workspace for creating and editing imaging orders.
 * Patient context is received via windowProps, ensuring the workspace
 * can function outside the patient chart.
 *
 * @example
 * ```typescript
 * launchWorkspace2(
 *   'add-imaging-order',
 *   { order: existingOrder, formContext: 'editing' },  // workspaceProps
 *   { patientUuid: 'uuid', patient: patientObj }       // windowProps
 * );
 * ```
 */
export default function AddImagingOrderWorkspace({
  closeWorkspace,
  workspaceProps,
  windowProps,
}: AddImagingOrderWorkspaceDefinition) {
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

  const [currentImagingOrder, setCurrentImagingOrder] = useState<ImagingOrderBasketItem | undefined>(initialOrder);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleCancel = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  const handleCloseWorkspaceWithSavedChanges = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  // Show loading state while patient data is being fetched
  if (!patientUuid && !patientData) {
    return null;
  }

  const title =
    formContext === 'editing' ? t('editImagingOrder', 'Edit Imaging Order') : t('addImagingOrder', 'Add Imaging Order');

  return (
    <Workspace2 title={title} hasUnsavedChanges={hasUnsavedChanges}>
      <div className={styles.container}>
        {isTablet && !isLoadingPatient && patientData && (
          <div className={styles.patientHeader}>
            <span className={styles.bodyShort02}>{getPatientName(patientData)}</span>
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
        {!currentImagingOrder ? (
          <TestTypeSearch openImagingForm={setCurrentImagingOrder} />
        ) : (
          <ImagingOrderForm
            initialOrder={currentImagingOrder}
            closeWorkspace={handleCancel}
            closeWorkspaceWithSavedChanges={handleCloseWorkspaceWithSavedChanges}
            onDirtyChange={setHasUnsavedChanges}
          />
        )}
      </div>
    </Workspace2>
  );
}
