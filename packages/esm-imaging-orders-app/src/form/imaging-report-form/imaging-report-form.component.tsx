import React, { useEffect, useMemo } from 'react';
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
  useWorkspace2Context,
} from '@openmrs/esm-framework';
import { type Result } from '../../imaging-tabs/work-list/work-list.resource';
import { Controller, useForm } from 'react-hook-form';
import { saveProcedureReport, useGetOrderConceptByUuid } from './imaging.resource';
import { Stack, Button, TextArea, ButtonSet, InlineLoading } from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type ImagingReportFormWorkspaceProps = {
  patient: any;
  order: Result;
};

type ImagingReportFormWindowProps = {
  patient: any;
  patientUuid: string;
  encounterUuid: string;
};

type ResultFormProps = Workspace2DefinitionProps<ImagingReportFormWorkspaceProps, ImagingReportFormWindowProps>;

const imagingReportSchema = z.object({
  procedureReport: z.string({ required_error: 'Imaging report is required' }).min(1, {
    message: 'Imaging report is required',
  }),
});

type ImagingReportFormData = z.infer<typeof imagingReportSchema>;

const ImagingReportForm: React.FC<ResultFormProps> = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // Use the workspace context to get the workspace props and functions
  const { workspaceProps, windowProps, closeWorkspace } = useWorkspace2Context() as Workspace2DefinitionProps<
    ImagingReportFormWorkspaceProps,
    ImagingReportFormWindowProps
  >;

  // Extract props - patient and order from workspace props, patientUuid from window props
  const patient = workspaceProps?.patient;
  const order = workspaceProps?.order;
  const patientUuid = windowProps?.patientUuid;

  const { patient: patientData, isLoading } = usePatient(patientUuid);
  const { concept, isLoading: isLoadingConcepts } = useGetOrderConceptByUuid(order?.concept?.uuid);
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
    const reportPayload = {
      patient: patientUuid,
      procedureOrder: order.uuid,
      concept: order.concept.uuid,
      status: 'COMPLETED',
      procedureReport: formData.procedureReport,
      encounters: [],
    };

    try {
      const response = await saveProcedureReport(reportPayload);
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
  if (!workspaceProps || !windowProps || !patientUuid || !order) {
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
