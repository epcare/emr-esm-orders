import React from 'react';
import { Layer } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import classNames from 'classnames';
import styles from './field-wrapper.scss';

export interface FieldWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  invalidText?: string;
  helperText?: string;
}

/**
 * FieldWrapper - A wrapper component for form fields with consistent responsive behavior.
 * Unlike ResponsiveWrapper, this accepts className prop and provides additional features.
 *
 * Features:
 * - className prop support for custom styling
 * - Wraps with Layer on tablet, plain div on desktop
 * - Optional label with required indicator
 * - Disabled and invalid state support
 * - Helper text and validation messages
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  className,
  id,
  label,
  required,
  disabled,
  invalid,
  invalidText,
  helperText,
}) => {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div id={id} className={classNames(styles.fieldWrapper, className, { [styles.disabled]: disabled })}>
      {label && (
        <div className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      )}
      {isTablet ? (
        <Layer level={1}>
          <div className={styles.fieldContent}>{children}</div>
        </Layer>
      ) : (
        <div className={styles.fieldContent}>{children}</div>
      )}
      {invalid && invalidText && <div className={styles.invalidText}>{invalidText}</div>}
      {helperText && !invalid && <div className={styles.helperText}>{helperText}</div>}
    </div>
  );
};
