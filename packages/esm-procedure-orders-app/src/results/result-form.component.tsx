import React, { useMemo, useState } from 'react';
import styles from './result-form.scss';
import { Button, InlineLoading, ModalBody, ModalFooter, TextArea, FormLabel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { closeOverlay } from '../components/overlay/hook';
import { ExtensionSlot, showNotification, showToast, usePatient, useConfig } from '@openmrs/esm-framework';
import { useGetOrderConceptByUuid, saveProcedureReport } from './result-form.resource';
import { useForm } from 'react-hook-form';
import { type Result } from '../types';
import { type ConfigObject } from '../config-schema';

interface ResultFormProps {
  patientUuid: string;
  order: Result;
}

const PostProcedureForm: React.FC<ResultFormProps> = ({ order, patientUuid }) => {
  const [report, setProcedureReport] = useState('');
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const {
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<{ testResult: string }>({
    defaultValues: {},
  });

  const { patient, isLoading } = usePatient(patientUuid);
  const { concept, isLoading: isLoadingConcepts } = useGetOrderConceptByUuid(order.concept.uuid);

  const bannerState = useMemo(() => {
    if (patient && patientUuid) {
      return {
        patient,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [patient, patientUuid]);

  if (isLoadingConcepts) {
    return <div>Loading procedure details</div>;
  }

  const onSubmit = (data, e) => {
    e.preventDefault();
    // assign result to test order

    // Build orphaned data for notes JSON
    const orphanedData = {
      procedureOrder: order.uuid,
      procedureReason: order?.orderReason?.uuid,
      category: order?.orderType?.uuid,
    };

    const reportPayload = {
      patient: patientUuid,
      procedureCoded: order.concept.uuid,
      status: config.procedureStatusConcepts.IN_PROGRESS, // Use concept UUID instead of enum
      notes: report,
      _orphanedData: orphanedData,
    };

    saveProcedureReport(reportPayload, config).then(
      () => {
        showToast({
          critical: true,
          title: t('saveReport', 'Report updated sucessful'),
          kind: 'success',
          description: t('generateSuccessfully', 'Report saved successfully'),
        });
        closeOverlay();
      },
      (err) => {
        showNotification({
          title: t(`errorSavingReport', 'Error occurred while saving the report`),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
  };
  return (
    <>
      <div className="">
        <ModalBody>
          {isLoading && (
            <InlineLoading
              className={styles.bannerLoading}
              iconDescription="Loading"
              description="Loading banner"
              status="active"
            />
          )}
          {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={bannerState} />}
          <section className={styles.section}>
            <form>
              <FormLabel className={styles.textArea}>{concept?.display}</FormLabel>
              {Object.keys(errors).length > 0 && <div className={styles.errorDiv}>Procedure report is required</div>}
              <TextArea
                id="procedureReport"
                name="procedureReport"
                rules={{
                  required: true,
                }}
                invalidText="Required"
                autofocus
                onChange={(e) => setProcedureReport(e.target.value)}
              />
            </form>
          </section>
        </ModalBody>

        <ModalFooter>
          <Button disabled={isSubmitting} onClick={() => closeOverlay()} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Save report</Button>
        </ModalFooter>
      </div>
    </>
  );
};

export default PostProcedureForm;
