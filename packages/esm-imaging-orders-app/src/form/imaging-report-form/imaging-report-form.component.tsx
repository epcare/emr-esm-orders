import React, { useMemo } from 'react';
import { mutate } from 'swr';
import styles from './imaging-report-form.scss';
import { useTranslation } from 'react-i18next';
import {
  type Workspace2DefinitionProps,
  ExtensionSlot,
  ResponsiveWrapper,
  showNotification,
  showSnackbar,
  useLayoutType,
  usePatient,
  useConfig,
} from '@openmrs/esm-framework';
import { type Result } from '../../imaging-tabs/work-list/work-list.resource';
import { Controller, useForm } from 'react-hook-form';
import { saveProcedureReport, useGetOrderConceptByUuid } from './imaging.resource';
import { Stack, Button, TextArea, ButtonSet, InlineLoading } from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ImagingConfig } from '../../config-schema';
import { type OrderWorkspaceDefinitionProps, type BaseOrderWorkspaceProps } from '../../types';

/**
 * Workspace props for imaging report form
 */
interface ImagingReportFormWorkspaceProps extends BaseOrderWorkspaceProps {
  order: Result;
}

/**
 * Window props for patient context
 */
interface ImagingReportFormWindowProps {
  patientUuid: string;
  encounterUuid: string;
}

/**
 * Combined workspace definition props
 */
type ImagingReportFormWorkspaceDefinition = OrderWorkspaceDefinitionProps<
  ImagingReportFormWorkspaceProps,
  ImagingReportFormWindowProps
>;

const imagingReportSchema = z.object({
  procedureReport: z.string({ required_error: 'Imaging report is required' }).min(1, {
    message: 'Imaging report is required',
  }),
});

type ImagingReportFormData = z.infer<typeof imagingReportSchema>;

const ImagingReportForm: React.FC<ImagingReportFormWorkspaceDefinition> = ({
  closeWorkspace,
  workspaceProps,
  windowProps,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Extract props - order from workspace props, patientUuid and encounterUuid from window props
  const order = workspaceProps?.order;
  const patientUuid = windowProps?.patientUuid;
  const encounterUuid = windowProps?.encounterUuid;

  const { patient: patientData, isLoading } = usePatient(patientUuid);
  const { concept, isLoading: isLoadingConcepts } = useGetOrderConceptByUuid(order?.concept?.uuid);
  const config = useConfig<ImagingConfig>();
  const {
    formState: { isSubmitting, errors, isDirty },
    control,
    handleSubmit,
  } = useForm<ImagingReportFormData>({
    defaultValues: {
      procedureReport: '',
    },
    resolver: zodResolver(imagingReportSchema),
    mode: 'all',
  });

  const bannerState = useMemo(() => {
    if (patientData) {
      return {
        patient: patientData,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [patientData, patientUuid]);

  // Note: promptBeforeClosing is not available in Workspace v2
  // The unsaved changes prompt is handled automatically by the workspace system

  const onSubmit = async (formData: ImagingReportFormData) => {
    // Build orphaned data for notes JSON
    const orphanedData = {
      procedureOrder: order.uuid,
      procedureReason: order?.orderReason?.uuid,
      category: order?.orderType?.uuid,
    };

    const reportPayload = {
      patient: patientUuid,
      procedureCoded: order.concept.uuid,
      status: config.procedureStatusConcepts.COMPLETED,
      notes: formData.procedureReport,
      _orphanedData: orphanedData,
    };

    try {
      const response = await saveProcedureReport(reportPayload, config, encounterUuid);
      if (response.ok) {
        showSnackbar({
          title: t('imagingOrderSaveSuccess', 'Imaging order saved successfully'),
          kind: 'success',
          subtitle: t(
            'imagingOrderSaveSuccessSubtitle',
            'Imaging order saved successfully. Report transitioned to awaiting approval.',
          ),
          isLowContrast: true,
        });
        await closeWorkspace({ discardUnsavedChanges: true });
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/order'), undefined, {
          revalidate: true,
        });
      }
    } catch (error) {
      showNotification({
        title: t('errorSavingReport', 'Error occurred while saving the report'),
        kind: 'error',
        critical: true,
        description: error?.message,
      });
    }
  };
  // Show loading state if workspace props are not available yet
  if (!patientUuid || !order) {
    return <InlineLoading status="active" iconDescription="Loading workspace..." />;
  }

  return (
    <>
      {patientData ? (
        <ExtensionSlot name="patient-header-slot" state={bannerState} />
      ) : (
        <InlineLoading status="active" iconDescription="Loading" />
      )}
      <form aria-label="imaging form" className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formContainer}>
          <Stack gap={7}>
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="procedureReport"
                render={({ field }) => (
                  <TextArea
                    labelText={concept?.display}
                    id="procedureReport"
                    name="procedureReport"
                    invalid={!!errors.procedureReport}
                    invalidText={errors.procedureReport?.message}
                    {...field}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Stack>
        </div>
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={() => closeWorkspace()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={isSubmitting || Object.keys(errors).length > 0}
            style={{ maxWidth: '50%' }}
            kind="primary"
            type="submit">
            {isSubmitting ? (
              <span style={{ display: 'flex', justifyItems: 'center' }}>
                {t('submitting', 'Submitting...')} <InlineLoading status="active" iconDescription="Loading" />
              </span>
            ) : (
              t('saveAndClose', 'Save & close')
            )}
          </Button>
        </ButtonSet>
      </form>
    </>
  );
};

export default ImagingReportForm;
