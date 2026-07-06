import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import ImagingResultForm from './imaging-result-form.component';
import { orderToImagingFormDefaults } from '../../resources/order-to-form-mapper';
import type {
  ConceptReference,
  OrderWorkspaceDefinitionProps,
  BaseOrderWorkspaceProps,
  BaseOrderWindowProps,
  Procedure,
  ProcedureType,
  Result,
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
export type ImagingResultFormWindowProps = BaseOrderWindowProps;

const createSchema = (t: (key: string, fallback: string) => string) =>
  z
    .object({
      // === TAB 1: PROCEDURE FIELDS (EMRAPI) ===
      procedureCoded: z.string().min(1, t('procedureRequired', 'A procedure is required')),
      procedureType: z.string().min(1, t('procedureTypeRequired', 'Procedure type is required')),
      bodySite: z.string().optional(), // Read-only from order
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

      // Additional fields from order (prefilled, read-only)
      laterality: z.string().optional(),
      urgency: z.string().optional(),
      orderReason: z.string().optional(),

      // === TAB 2: OBSERVATION FIELDS ===
      // Imaging Details
      imagingModality: z.string().optional(), // Coded - stored as UUID
      contrastAgent: z.string().optional(), // Coded - stored as UUID
      accessionNumber: z.string().optional(),
      dicomStudyUid: z.string().optional(),
      radiationDose: z.number().nullable().optional(),
      clinicalIndication: z.string().optional(),

      // Imaging Results
      imagingFindings: z.string().optional(),
      imagingImpression: z.string().min(1, t('impressionRequired', 'Impression is required')),
      imagingImages: z.array(z.string()).optional(), // Array of image attachment UUIDs

      // Orphaned data for order reference
      _orphanedData: z
        .object({
          procedureOrder: z.string().optional(),
          procedureReason: z.string().optional(),
          category: z.string().optional(),
          accessionNumber: z.string().optional(),
        })
        .optional(),
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

export type ImagingResultFormSchema = z.infer<ReturnType<typeof createSchema>> & {
  // Additional non-schema fields
  _orphanedData?: {
    procedureOrder?: string;
    procedureReason?: string;
    category?: string;
    accessionNumber?: string;
  };
};

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

  // Map order data to imaging form defaults using centralized mapper
  const formDefaults = useMemo(() => orderToImagingFormDefaults(order, procedure), [order, procedure]);

  const methods = useForm<ImagingResultFormSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      // Procedure fields (from mapper)
      procedureCoded: formDefaults.procedureCoded,
      procedureType: procedure?.procedureType?.uuid ?? '',
      bodySite: formDefaults.bodySite,
      startDateTime: formDefaults.startDateTime,
      endDateTime: formDefaults.endDateTime,
      status: formDefaults.status,
      notes: formDefaults.notes,
      estimatedStartDate: formDefaults.estimatedStartDate,
      duration: formDefaults.duration,
      durationUnit: formDefaults.durationUnit,
      outcomeCoded: formDefaults.outcomeCoded,
      participants: [],
      complications: [],
      // Include orphaned data from order
      laterality: formDefaults.laterality,
      urgency: formDefaults.urgency,
      orderReason: formDefaults.orderReason,
      _orphanedData: formDefaults._orphanedData,
      // Imaging observation fields (from mapper)
      imagingModality: formDefaults.imagingModality,
      contrastAgent: formDefaults.contrastAgent,
      accessionNumber: formDefaults.accessionNumber,
      dicomStudyUid: formDefaults.dicomStudyUid,
      radiationDose: formDefaults.radiationDose,
      clinicalIndication: formDefaults.clinicalIndication,
      imagingFindings: formDefaults.imagingFindings,
      imagingImpression: formDefaults.imagingImpression,
      imagingImages: formDefaults.imagingImages ?? [],
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
