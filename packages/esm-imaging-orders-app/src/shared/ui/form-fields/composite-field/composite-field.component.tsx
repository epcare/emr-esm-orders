import React from 'react';
import classNames from 'classnames';
import styles from './composite-field.scss';

export interface CompositeFieldProps {
  children: React.ReactNode;
  className?: string;
  /** Single shared label for the composite field */
  label?: React.ReactNode;
  /** Whether the field group is required */
  required?: boolean;
  /** Helper text to display below the label */
  helperText?: string;
  /** Column layout: 'equal' for 1fr 1fr, 'proportional' for custom ratios */
  layout?: 'equal' | 'proportional' | 'auto';
  /** Custom column ratios (e.g., [2, 1] for 2:1 ratio) */
  ratios?: number[];
  /** Gap between fields */
  gap?: string;
  /** Whether the field group is invalid */
  invalid?: boolean;
  /** Validation message */
  invalidText?: string;
}

/**
 * CompositeField - Groups related fields with clear visual boundaries.
 *
 * Features:
 * - Subtle border/background for visual grouping
 * - Single shared label (eliminates duplication)
 * - Grid layout support (equal/proportional columns)
 * - Responsive stacking on mobile
 */
export const CompositeField: React.FC<CompositeFieldProps> = ({
  children,
  className,
  label,
  required,
  helperText,
  layout = 'equal',
  ratios,
  gap = '1rem',
  invalid,
  invalidText,
}) => {
  const gridStyle = React.useMemo(() => {
    const style: React.CSSProperties = { gap };

    if (layout === 'equal') {
      style.gridTemplateColumns = '1fr 1fr';
    } else if (layout === 'proportional' && ratios) {
      style.gridTemplateColumns = ratios.map((r) => `${r}fr`).join(' ');
    }

    return style;
  }, [layout, ratios, gap]);

  return (
    <div className={classNames(styles.compositeField, { [styles.invalid]: invalid }, className)}>
      {(label || helperText || invalidText) && (
        <div className={styles.header}>
          {label && (
            <div className={styles.label}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </div>
          )}
          {helperText && !invalid && <div className={styles.helperText}>{helperText}</div>}
          {invalid && invalidText && <div className={styles.invalidText}>{invalidText}</div>}
        </div>
      )}
      <div className={styles.content} style={layout !== 'auto' ? gridStyle : undefined}>
        {children}
      </div>
    </div>
  );
};
