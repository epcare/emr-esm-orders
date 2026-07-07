import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProcedureActiveOrderResults from './procedure-active-order/procedure-active-order-results.component';
import ProcedurePastOrderResults from './procedure-past-test/procedure-past-test-order-results.component';

interface PatientProcedureResultsProps {
  patientUuid: string;
}

const PatientProcedureResults: React.FC<PatientProcedureResultsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const [hasActiveOrderResults, setHasActiveOrderResults] = useState<boolean | null>(null);

  return (
    <>
      <div style={{ margin: '10px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <ProcedureActiveOrderResults patientUuid={patientUuid} />
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <ProcedurePastOrderResults patientUuid={patientUuid} />
        </div>
      </div>
    </>
  );
};

export default PatientProcedureResults;
