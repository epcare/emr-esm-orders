import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { NumberInput, ComboBox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from './duration-field.scss';
import type { ConceptReference } from '../../../../types';

export interface DurationFieldProps {
  /** Form field name for the duration value */
  valueName: string;
  /** Form field name for the duration unit */
  unitName: string;
  /** Available unit options */
  unitOptions: ConceptReference[];
  /** Label for the composite field */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * DurationField - A composite field for entering duration value and unit.
 *
 * Features:
 * - Fluid responsive width for unit field (not fixed 180px)
 * - Integrated Controller handling for both fields
 * - Visual grouping as single cohesive unit
 * - Responsive behavior (stacks on mobile)
 * - Shared validation between value and unit
 */
export const DurationField: React.FC<DurationFieldProps> = ({
  valueName,
  unitName,
  unitOptions,
  label,
  required,
  disabled,
  className,
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <div className={classNames(styles.durationField, className)}>
      {label && (
        <div className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      )}
      <div className={styles.durationFieldContent}>
        <Controller
          name={valueName}
          control={control}
          render={({ field, fieldState }) => (
            <NumberInput
              {...field}
              id={valueName}
              label={t('durationValue', 'Duration')}
              placeholder={t('enterDuration', 'Enter duration')}
              min={1}
              hideSteppers
              allowEmpty
              disabled={disabled}
              invalid={Boolean(fieldState.error)}
              invalidText={fieldState.error?.message}
              value={field.value ?? ''}
              onChange={(_event, { value: nextValue }: { value: number | string }) => {
                if (nextValue == null || nextValue === '') {
                  field.onChange(null);
                  return;
                }
                const parsed = typeof nextValue === 'number' ? nextValue : Number(nextValue);
                field.onChange(Number.isNaN(parsed) ? null : parsed);
              }}
            />
          )}
        />
        <Controller
          name={unitName}
          control={control}
          render={({ field, fieldState }) => (
            <div className={styles.unitFieldWrapper}>
              <ComboBox
                {...field}
                id={unitName}
                titleText={t('durationUnit', 'Duration unit')}
                placeholder={t('selectDurationUnit', 'Select unit')}
                items={unitOptions}
                itemToString={(item: ConceptReference) => item?.display ?? ''}
                selectedItem={unitOptions.find((option) => option.uuid === field.value) ?? null}
                onChange={({ selectedItem }: { selectedItem: ConceptReference | null }) =>
                  field.onChange(selectedItem?.uuid ?? null)
                }
                disabled={disabled}
                invalid={Boolean(fieldState.error)}
                invalidText={fieldState.error?.message}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
};
