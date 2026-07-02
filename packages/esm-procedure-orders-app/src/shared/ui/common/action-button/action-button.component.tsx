import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, launchWorkspace2 } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import OrderActionExtension from './order-action-extension.component';
import { type Result } from '../../../../types';
import { launchOverlay } from '../../../../components/overlay/hook';
import PostProcedureForm from '../../../../form/post-procedures/post-procedure-form.component';
import styles from './action-button.scss';

type ActionButtonProps = {
  action: {
    actionName: string;
  };
  order: Result;
  patientUuid: string;
  // Allow consuming apps to pass custom workspace names when they register workspaces into their own windows
  procedureResultFormWorkspaceName?: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  order,
  patientUuid,
  procedureResultFormWorkspaceName = 'procedureResultFormWorkspace',
}) => {
  const { t } = useTranslation();

  const handleOpenProcedureResultForm = () => {
    launchWorkspace2(
      procedureResultFormWorkspaceName,
      { order, formContext: 'creating' }, // workspaceProps - removed redundant patient prop
      {
        // windowProps - patient context
        patientUuid: order.patient.uuid,
        patient: order.patient,
        encounterUuid: order.encounter?.uuid ?? '',
      },
    );
  };
  switch (action.actionName) {
    case 'add-procedure-to-worklist-dialog':
      return (
        <Button
          onClick={() => {
            const dispose = showModal(action.actionName, {
              closeModal: () => dispose(),
              order: order,
            });
          }}
          size="md"
          className={styles.actionButtons}>
          {t('pickProcedureOrder', 'Pick Procedure Order')}
        </Button>
      );

    case 'postProcedureResultForm':
      return (
        <Button kind="primary" onClick={handleOpenProcedureResultForm} size="md" className={styles.actionButtons}>
          {t('procedureResultForm', 'Procedure Result Form')}
        </Button>
      );

    case 'reject-procedure-order-dialog':
      return (
        <Button
          kind={action.actionName === 'reject-procedure-order-dialog' ? 'danger' : 'tertiary'}
          onClick={() => {
            const dispose = showModal(action.actionName, {
              closeModal: () => dispose(),
              order: order,
            });
          }}
          size="md"
          className={styles.actionButtons}>
          {t(
            action.actionName.replace(/-/g, ''),
            action.actionName
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
              .replace('Modal', ''),
          )}
        </Button>
      );

    default:
      return null;
  }
};

export default ActionButton;
