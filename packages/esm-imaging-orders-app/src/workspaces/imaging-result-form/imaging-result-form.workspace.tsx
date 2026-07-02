import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import ImagingResultForm from './imaging-result-form.component';
import type { Procedure, ProcedureType, ConceptReference } from '../../types';
import type { Result } from '../../types';
import {
  type OrderWorkspaceDefinitionProps,
  type BaseOrderWorkspaceProps,
  type BaseOrderWindowProps,
} from '../../types';

/**
 * Workspace props for imaging result form
 */
export interface ImagingResultFormWorkspaceProps extends BaseOrderWorkspaceProps {
  order?: Result;
  procedure?: Procedure;
}

/**
 * Window props for patient context
 */
export interface ImagingResultFormWindowProps extends BaseOrderWindowProps {}

/**
 * Helper function to combine notes from multiple sources
 */
const combineNotes = (instructions?: string, commentsToFulfiller?: string, existingNotes?: string): string => {
  const parts: string[] = [];
  if (instructions?.trim()) {
    parts.push(`Instructions: ${instructions.trim()}`);
  }
  if (commentsToFulfiller?.trim()) {
    parts.push(`Comments: ${commentsToFulfiller.trim()}`);
  }
  if (existingNotes?.trim()) {
    parts.push(existingNotes.trim());
  }
  return parts.join('\n\n');
};

const createSchema = (t: (key: string, fallback: string) => string) =>
  z
    .object({
      procedureCoded: z.string().min(1, t('procedureRequired', 'A procedure is required')),
      procedureType: z.string().min(1, t('procedureTypeRequired', 'Procedure type is required')),
      bodySite: z.string().min(1, t('bodySiteRequired', 'Body site is required')),
      startDateTime: z.date().optional().nullable(),
      endDateTime: z.date().optional().nullable(),
      status: z.string().min(1, t('statusRequired', 'Status is required')),
      notes: z.string().optional(),
      estimatedStartDate: z.string().optional(),
      duration: z
        .number()
        .int()
        .positive(t('durationPositive', 'Duration must be a positive number'))
        .nullable()
        .optional(),
      durationUnit: z.string().optional().nullable(),
      // Extended fields for imaging results
      outcomeCoded: z.string().min(1, t('outcomeRequired', 'Outcome is required')),
      participants: z.array(z.string()).optional(),
      complications: z.array(z.string()).optional(),
    })
    .refine((data) => Boolean(data.startDateTime) || Boolean(data.estimatedStartDate), {
      message: t('startDateRequired', 'Start date is required'),
      path: ['startDateTime'],
    })
    .refine(
      (data) => {
        if (!data.endDateTime) return true;
        if (data.startDateTime) {
          return data.endDateTime >= data.startDateTime;
        }
        if (data.estimatedStartDate) {
          const [year, month] = data.estimatedStartDate.split('-').map(Number);
          const start = new Date(year, Number.isFinite(month) ? month - 1 : 0, 1);
          return data.endDateTime >= start;
        }
        return true;
      },
      { message: t('endDateAfterStart', 'End date must be on or after start date'), path: ['endDateTime'] },
    )
    .refine(
      (data) => {
        const hasDuration = data.duration != null;
        return !hasDuration || Boolean(data.durationUnit);
      },
      {
        message: t('durationUnitRequired', 'Duration unit is required when a duration is provided'),
        path: ['durationUnit'],
      },
    );

export type ImagingResultFormSchema = z.infer<ReturnType<typeof createSchema>>;

/**
 * Imaging Result Form Workspace
 *
 * A standalone workspace for capturing imaging results.
 * Receives order/procedure context via workspaceProps and patient context via windowProps.
 */
type ImagingResultFormWorkspaceDefinition = OrderWorkspaceDefinitionProps<
  ImagingResultFormWorkspaceProps,
  ImagingResultFormWindowProps
>;

export default function ImagingResultFormWorkspace({
  closeWorkspace,
  workspaceProps,
  windowProps,
}: ImagingResultFormWorkspaceDefinition) {
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);

  // Extract props
  const order = workspaceProps?.order;
  const procedure = workspaceProps?.procedure;
  const formContext = workspaceProps?.formContext ?? 'creating';
  const patientUuid = windowProps?.patientUuid || '';

  // Map order data to imaging form defaults
  const combinedNotes = useMemo(
    () => combineNotes(order?.instructions, order?.commentToFulfiller, procedure?.notes),
    [order, procedure],
  );

  const methods = useForm<ImagingResultFormSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      procedureCoded: order?.concept?.uuid ?? procedure?.procedureCoded?.uuid ?? '',
      procedureType: procedure?.procedureType?.uuid ?? '',
      bodySite: order?.bodySite ?? procedure?.bodySite?.uuid ?? '',
      startDateTime: procedure?.startDateTime ? new Date(procedure.startDateTime) : null,
      endDateTime: procedure?.endDateTime ? new Date(procedure.endDateTime) : null,
      status: procedure?.status?.uuid ?? '',
      notes: combinedNotes,
      estimatedStartDate: procedure?.estimatedStartDate ?? '',
      duration: typeof procedure?.duration === 'number' ? procedure.duration : null,
      durationUnit: procedure?.durationUnit?.uuid ?? '',
      // Extended fields defaults
      outcomeCoded: '',
      participants: [],
      complications: [],
    },
  });

  const closeWorkspaceHandler = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  return (
    <Workspace2
      title={
        formContext === 'editing'
          ? t('editImagingResult', 'Edit Imaging Result')
          : t('recordImagingResult', 'Record Imaging Result')
      }
      hasUnsavedChanges={methods.formState.isDirty}>
      <FormProvider {...methods}>
        <ImagingResultForm
          closeWorkspace={closeWorkspaceHandler}
          patientUuid={patientUuid}
          order={order}
          procedure={procedure}
          formContext={formContext}
        />
      </FormProvider>
    </Workspace2>
  );
}
