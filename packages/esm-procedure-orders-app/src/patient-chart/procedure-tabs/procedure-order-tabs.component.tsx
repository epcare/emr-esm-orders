import React, { useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import styles from './procedure-order-tabs.scss';
import { useTranslation } from 'react-i18next';
import PatientProcedureReferralResults from '../procedure-order-referals/procedure-order-referals.component';
import PatientProcedureResults from '../patient-procedure-results.component';

interface ProcedureResultsTabsProps {
  patientUuid: string;
}

const ProcedureResultsTabs: React.FC<ProcedureResultsTabsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <div className={styles.container}>
        <Tabs
          selectedIndex={selectedTab}
          onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
          className={styles.tabs}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="procedure results tabs" contained>
            <Tab style={{ width: '150px' }}>{t('pending', 'Routine Tests')}</Tab>
            <Tab style={{ width: '150px' }}>{t('referals', 'Referrals')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel style={{ padding: 0 }}>
              <PatientProcedureResults patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel style={{ padding: 0 }}>
              <div style={{ margin: '10px' }}>
                <PatientProcedureReferralResults patientUuid={patientUuid} />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </>
  );
};

export default ProcedureResultsTabs;
