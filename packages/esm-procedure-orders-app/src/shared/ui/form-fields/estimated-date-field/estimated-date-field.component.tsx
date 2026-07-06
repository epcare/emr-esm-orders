import React from 'react';
import { ComboBox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper } from '@openmrs/esm-styleguide';
import classNames from 'classnames';
import styles from './estimated-date-field.scss';

export interface YearOption {
  id: string;
  label: string;
}

export interface MonthOption {
  id: string;
  label: string;
}

export interface EstimatedDateFieldProps {
  /** Currently selected year ID */
  year: string;
  /** Currently selected month ID */
  month: string;
  /** Callback when year changes */
  onYearChange: (year: string) => void;
  /** Callback when month changes */
  onMonthChange: (month: string) => void;
  /** Available year options */
  yearOptions: Array<{ id: string; label: string }>;
  /** Available month options */
  monthOptions: Array<{ id: string; label: string }>;
  /** Label for the composite field */
  label?: string;
  /** Whether year is required */
  yearRequired?: boolean;
  /** Whether the field group is invalid */
  invalid?: boolean;
  /** Validation message */
  invalidText?: string;
  /** Additional class name */
  className?: string;
}

/**
 * EstimatedDateField - A composite field for selecting estimated start date (year + month).
 *
 * Features:
 * - Year field with constrained width (years are short: "2024")
 * - Month field with flexible width (months are longer: "January")
 * - Visual grouping as single cohesive unit
 * - Responsive behavior (stacks on mobile)
 */
export const EstimatedDateField: React.FC<EstimatedDateFieldProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  yearOptions,
  monthOptions,
  label,
  yearRequired = false,
  invalid,
  invalidText,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.estimatedDateField, className)}>
      {label && (
        <div className={styles.label}>
          {label}
          {yearRequired && <span className={styles.required}>*</span>}
        </div>
      )}
      <div className={styles.estimatedDateContent}>
        <div className={styles.yearFieldWrapper}>
          <ResponsiveWrapper>
            <ComboBox
              id="estimatedYear"
              titleText={t('year', 'Year')}
              placeholder={t('selectYear', 'Select year')}
              items={yearOptions}
              itemToString={(item: YearOption) => item?.label ?? ''}
              selectedItem={yearOptions.find((y) => y.id === year) ?? null}
              onChange={({ selectedItem }: { selectedItem: YearOption | null }) => onYearChange(selectedItem?.id ?? '')}
              invalid={invalid}
              invalidText={invalidText}
            />
          </ResponsiveWrapper>
        </div>
        <div className={styles.monthFieldWrapper}>
          <ResponsiveWrapper>
            <ComboBox
              id="estimatedMonth"
              titleText={t('monthOptional', 'Month (optional)')}
              placeholder={t('selectMonth', 'Select month (optional)')}
              items={monthOptions}
              itemToString={(item: MonthOption) => item?.label ?? ''}
              selectedItem={monthOptions.find((m) => m.id === month) ?? null}
              onChange={({ selectedItem }: { selectedItem: MonthOption | null }) =>
                onMonthChange(selectedItem?.id ?? '')
              }
            />
          </ResponsiveWrapper>
        </div>
      </div>
    </div>
  );
};
