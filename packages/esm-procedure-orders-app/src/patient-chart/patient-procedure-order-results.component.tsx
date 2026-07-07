import React from 'react';
import ProcedureResultsTabs from './procedure-tabs/procedure-order-tabs.component';

interface PatientProcedureOrderResultsProps {
  patientUuid: string;
}

const PatientProcedureOrderResults: React.FC<PatientProcedureOrderResultsProps> = ({ patientUuid }) => {
  return <ProcedureResultsTabs patientUuid={patientUuid} />;
};

export default PatientProcedureOrderResults;
