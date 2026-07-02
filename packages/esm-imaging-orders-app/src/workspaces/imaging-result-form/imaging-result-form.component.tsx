import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Button,
  ButtonSet,
  ComboBox,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  NumberInput,
  Stack,
  Switch,
  TextArea,
  Search,
  Tile,
  Tag,
} from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-styleguide';
import { showSnackbar, useConfig, useLayoutType, useDebounce } from '@openmrs/esm-framework';
import type { ConfigObject } from '../../config-schema';
import {
  saveImagingResult,
  useConceptSearch,
  useConceptSearchField,
  useProcedureTypes,
  useProvidersSearch,
  useConditionsSearch,
} from '../../resources/imaging-result-form.resource';
import type { ConceptReference, Procedure, ProcedureType, CodedProvider, CodedCondition } from '../../types';
import type { ImagingResultFormSchema } from './imaging-result-form.workspace';
import styles from './imaging-result-form.scss';

const ConceptSearchField = ({ label, placeholder, field, selectedConcept, onChange, invalid, invalidText }) => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, searchResults, isSearching, clear } = field;

  const handleSelect = (concept: ConceptReference) => {
    onChange(concept);
    clear();
    setSearchTerm('');
  };

  return (
    <div>
      <Search
        labelText={label}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={() => {
          clear();
          setSearchTerm('');
        }}
      />
      {isSearching && <InlineLoading description={t('loading', 'Loading') + '...'} />}
      {searchResults && searchResults.length > 0 && (
        <div className={styles.searchResults}>
          {searchResults.map((concept) => (
            <div key={concept.uuid} className={styles.searchResultItem} onClick={() => handleSelect(concept)}>
              {concept.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type ImagingResultFormComponentProps = {
  closeWorkspace: () => void;
  procedure?: Procedure;
  order?: any;
  patientUuid: string;
  formContext: 'creating' | 'editing' | 'reviewing';
};

const ImagingResultFormComponent: React.FC<ImagingResultFormComponentProps> = ({
  closeWorkspace,
  patientUuid,
  procedure,
  order,
  formContext,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const {
    procedureConceptUuid,
    procedureConceptSourceType,
    bodySiteConceptUuid,
    bodySiteConceptSourceType,
    statusConceptUuid,
    statusConceptSourceType,
    durationUnitConceptUuid,
    durationUnitConceptSourceType,
    procedureStatusConcepts,
    procedureOutcomeConcepts,
    procedureComplicationConceptUuid,
    procedureComplicationGroupingConceptUuid,
    procedureResultEncounterRole,
    procedureOrderRefConceptUuid,
    useOrderEncounter,
  } = config;

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    getValues,
    setValue,
    trigger,
  } = useFormContext<ImagingResultFormSchema>();

  const { procedureTypes, isLoading: isLoadingProcedureTypes } = useProcedureTypes();
  const today = useMemo(() => new Date(), []);
  const watchedStartDateTime = useWatch({ control, name: 'startDateTime' });
  const endDateMin = useMemo(() => {
    if (!watchedStartDateTime) return undefined;
    const startOfDay = new Date(watchedStartDateTime);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }, [watchedStartDateTime]);

  const isTablet = useLayoutType() === 'tablet';
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isStartDateKnown, setIsStartDateKnown] = useState(!getValues('estimatedStartDate'));
  const initialEstimatedDate = getValues('estimatedStartDate');
  const [estimatedYear, setEstimatedYear] = useState(initialEstimatedDate?.split('-')[0] ?? '');
  const [estimatedMonth, setEstimatedMonth] = useState(initialEstimatedDate?.split('-')[1] ?? '');

  // Extended fields state
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const debouncedProviderSearchTerm = useDebounce(providerSearchTerm);
  const { providerSearchResults, isProviderSearching } = useProvidersSearch(debouncedProviderSearchTerm);
  const [selectedParticipants, setSelectedParticipants] = useState<CodedProvider[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  const [conditionSearchTerm, setConditionSearchTerm] = useState('');
  const debouncedConditionSearchTerm = useDebounce(conditionSearchTerm);
  const { conditionSearchResults, isConditionSearching } = useConditionsSearch(debouncedConditionSearchTerm);
  const [selectedComplications, setSelectedComplications] = useState<CodedCondition[]>([]);
  const [showComplications, setShowComplications] = useState(false);

  useEffect(() => {
    const value =
      !isStartDateKnown && estimatedYear ? (estimatedMonth ? `${estimatedYear}-${estimatedMonth}` : estimatedYear) : '';
    setValue('estimatedStartDate', value);
    if (isSubmitted) {
      trigger('startDateTime');
    }
  }, [isStartDateKnown, estimatedYear, estimatedMonth, setValue, isSubmitted, trigger]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
      id: String(currentYear - i),
      label: String(currentYear - i),
    }));
  }, []);

  const monthOptions = useMemo(
    () => [
      { id: '01', label: t('january', 'January') },
      { id: '02', label: t('february', 'February') },
      { id: '03', label: t('march', 'March') },
      { id: '04', label: t('april', 'April') },
      { id: '05', label: t('may', 'May') },
      { id: '06', label: t('june', 'June') },
      { id: '07', label: t('july', 'July') },
      { id: '08', label: t('august', 'August') },
      { id: '09', label: t('september', 'September') },
      { id: '10', label: t('october', 'October') },
      { id: '11', label: t('november', 'November') },
      { id: '12', label: t('december', 'December') },
    ],
    [t],
  );

  const outcomeOptions = useMemo(
    () => [
      { id: 'SUCCESSFUL', label: t('successful', 'Successful') },
      { id: 'PARTIALLY_SUCCESSFUL', label: t('partiallySuccessful', 'Partially Successful') },
      { id: 'NOT_SUCCESSFUL', label: t('notSuccessful', 'Not Successful') },
    ],
    [t],
  );

  const procedureField = useConceptSearchField({ uuid: procedureConceptUuid, sourceType: procedureConceptSourceType });
  const bodySiteField = useConceptSearchField({ uuid: bodySiteConceptUuid, sourceType: bodySiteConceptSourceType });

  const [procedureConcept, setProcedureConcept] = useState<ConceptReference | null>(
    procedure?.procedureCoded?.uuid ? procedure.procedureCoded : null,
  );
  const [bodySiteConcept, setBodySiteConcept] = useState<ConceptReference | null>(
    procedure?.bodySite?.uuid ? procedure.bodySite : null,
  );
  const { searchResults: statusOptions, error: statusOptionsError } = useConceptSearch('', {
    uuid: statusConceptUuid,
    sourceType: statusConceptSourceType,
  });

  const { searchResults: durationUnitOptions, error: durationUnitOptionsError } = useConceptSearch('', {
    uuid: durationUnitConceptUuid,
    sourceType: durationUnitConceptSourceType,
  });

  const [errorSaving, setErrorSaving] = useState(null);

  // Handle participant selection
  const handleParticipantSelect = useCallback(
    (provider: CodedProvider) => {
      if (!selectedParticipants.find((p) => p.uuid === provider.uuid)) {
        setSelectedParticipants([...selectedParticipants, provider]);
        setValue('participants', [...selectedParticipants.map((p) => p.uuid), provider.uuid]);
      }
      setShowParticipants(false);
      setProviderSearchTerm('');
    },
    [selectedParticipants, setValue],
  );

  const handleParticipantRemove = useCallback(
    (provider: CodedProvider) => {
      setSelectedParticipants(selectedParticipants.filter((p) => p.uuid !== provider.uuid));
      setValue(
        'participants',
        selectedParticipants.filter((p) => p.uuid !== provider.uuid).map((p) => p.uuid),
      );
    },
    [selectedParticipants, setValue],
  );

  // Handle complication selection
  const handleComplicationSelect = useCallback(
    (condition: CodedCondition) => {
      if (!selectedComplications.find((c) => c.concept.uuid === condition.concept.uuid)) {
        setSelectedComplications([...selectedComplications, condition]);
        setValue('complications', [...selectedComplications.map((c) => c.concept.uuid), condition.concept.uuid]);
      }
      setShowComplications(false);
      setConditionSearchTerm('');
    },
    [selectedComplications, setValue],
  );

  const handleComplicationRemove = useCallback(
    (condition: CodedCondition) => {
      setSelectedComplications(selectedComplications.filter((c) => c.concept.uuid !== condition.concept.uuid));
      setValue(
        'complications',
        selectedComplications.filter((c) => c.concept.uuid !== condition.concept.uuid).map((c) => c.concept.uuid),
      );
    },
    [selectedComplications, setValue],
  );

  const handleSave = useCallback(async () => {
    setIsSubmittingForm(true);
    const startDateTime = getValues('startDateTime');
    const endDateTime = getValues('endDateTime');
    const notes = getValues('notes');
    const duration = getValues('duration');
    const durationUnit = getValues('durationUnit');
    const outcomeCoded = getValues('outcomeCoded');

    const estimatedStartDate = getValues('estimatedStartDate');
    const hasDuration = typeof duration === 'number' && !Number.isNaN(duration);

    // Build participants array
    const participants = selectedParticipants.map((p) => ({
      provider: p.uuid,
      encounterRole: procedureResultEncounterRole,
    }));

    // Build complications array (grouped observations)
    const complications = selectedComplications.map((c) => ({
      groupMembers: [
        {
          concept: procedureComplicationConceptUuid,
          valueCoded: c.concept.uuid,
        },
      ],
      concept: procedureComplicationGroupingConceptUuid,
    }));

    // Build orphaned data from order
    const orphanedData = {
      procedureOrder: order?.uuid,
      procedureReason: order?.orderReason?.uuid,
      category: order?.orderType?.uuid,
    };

    const payload = {
      patient: patientUuid,
      procedureCoded: getValues('procedureCoded'),
      procedureType: getValues('procedureType'),
      bodySite: getValues('bodySite') || null,
      startDateTime: startDateTime ? dayjs(startDateTime).format() : null,
      endDateTime: endDateTime ? dayjs(endDateTime).format() : null,
      status: getValues('status'),
      notes: notes,
      estimatedStartDate: estimatedStartDate || null,
      duration: hasDuration ? duration : null,
      durationUnit: hasDuration && durationUnit ? durationUnit : null,
      // Extended fields
      outcomeCoded: outcomeCoded ? procedureOutcomeConcepts[outcomeCoded] : null,
      participants: participants,
      complications: complications,
      _orphanedData: orphanedData,
    };

    try {
      const encounterUuid = order?.encounter?.uuid;
      await saveImagingResult(payload, order?.uuid, encounterUuid, useOrderEncounter, config);
      showSnackbar({
        kind: 'success',
        title: procedure?.uuid ? t('imagingUpdated', 'Imaging updated') : t('imagingSaved', 'Imaging saved'),
        subtitle: procedure?.uuid
          ? t('imagingUpdatesNowVisible', 'Changes to the imaging are now visible on the Imaging page')
          : t('imagingNowVisible', 'It is now visible on the Imaging page'),
      });
      closeWorkspace();
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorSaving(error);
    }
  }, [
    closeWorkspace,
    getValues,
    patientUuid,
    procedure?.uuid,
    t,
    order,
    selectedParticipants,
    selectedComplications,
    procedureOutcomeConcepts,
    procedureResultEncounterRole,
    procedureComplicationConceptUuid,
    procedureComplicationGroupingConceptUuid,
    useOrderEncounter,
    config,
  ]);

  const onError = () => setIsSubmittingForm(false);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(handleSave, onError)}>
      <div className={styles.formContainer}>
        <Stack gap={7}>
          <FormGroup legendText={<RequiredFieldLabel label={t('imagingProcedure', 'Imaging Procedure')} />}>
            <Controller
              name="procedureCoded"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <ConceptSearchField
                    label={t('enterProcedure', 'Enter imaging procedure')}
                    placeholder={t('searchProcedures', 'Search imaging procedures')}
                    field={procedureField}
                    selectedConcept={procedureConcept}
                    onChange={(concept) => {
                      setProcedureConcept(concept);
                      field.onChange(concept?.uuid ?? '');
                    }}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </>
              )}
            />
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('procedureType', 'Procedure type')} />}>
            {isLoadingProcedureTypes ? (
              <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
            ) : (
              <ResponsiveWrapper>
                <Controller
                  name="procedureType"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ComboBox
                      id="procedureType"
                      titleText=""
                      aria-label={t('procedureType', 'Procedure type')}
                      placeholder={t('selectProcedureType', 'Select procedure type')}
                      items={procedureTypes}
                      itemToString={(item: ProcedureType) => item?.display ?? ''}
                      initialSelectedItem={procedureTypes.find((pt) => pt.uuid === field.value) ?? null}
                      onChange={({ selectedItem }: { selectedItem: ProcedureType | null }) =>
                        field.onChange(selectedItem?.uuid ?? '')
                      }
                      invalid={Boolean(fieldState.error)}
                      invalidText={fieldState.error?.message}
                    />
                  )}
                />
              </ResponsiveWrapper>
            )}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('bodySite', 'Body site')} />}>
            <Controller
              name="bodySite"
              control={control}
              render={({ field, fieldState }) => (
                <ConceptSearchField
                  label={t('enterBodySite', 'Enter body site')}
                  placeholder={t('searchBodySites', 'Search body sites')}
                  field={bodySiteField}
                  selectedConcept={bodySiteConcept}
                  onChange={(concept) => {
                    setBodySiteConcept(concept);
                    field.onChange(concept?.uuid ?? '');
                  }}
                  invalid={Boolean(fieldState.error)}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('isStartDateKnown', 'Is start date known?')}>
            <ContentSwitcher
              size="md"
              selectedIndex={isStartDateKnown ? 0 : 1}
              onChange={({ index }: { index: number }) => {
                const isKnown = index === 0;
                setIsStartDateKnown(isKnown);

                if (!isKnown) {
                  setValue('startDateTime', null);
                }

                setEstimatedYear('');
                setEstimatedMonth('');
              }}>
              <Switch name="yes">{t('yes', 'Yes')}</Switch>
              <Switch name="no">{t('no', 'No')}</Switch>
            </ContentSwitcher>
          </FormGroup>

          {isStartDateKnown && (
            <FormGroup legendText={<RequiredFieldLabel label={t('startDateAndTime', 'Start date and time')} />}>
              <Controller
                name="startDateTime"
                control={control}
                render={({ field, fieldState }) => (
                  <ResponsiveWrapper>
                    <DatePicker
                      datePickerType="single"
                      onChange={(event) => {
                        field.onChange(event[0]);
                      }}
                      value={field.value}>
                      <DatePickerInput
                        placeholder="mm/dd/yyyy"
                        labelText={t('startDate', 'Start Date')}
                        id="startDateTime"
                        size="md"
                        invalid={!!fieldState.error}
                        invalidText={fieldState.error?.message}
                      />
                    </DatePicker>
                  </ResponsiveWrapper>
                )}
              />
            </FormGroup>
          )}

          {!isStartDateKnown && (
            <FormGroup legendText={t('estimatedStartDate', 'Estimated start date')}>
              <div className={styles.twoColumnGroup}>
                <ResponsiveWrapper>
                  <ComboBox
                    id="estimatedYear"
                    titleText={<RequiredFieldLabel label={t('year', 'Year')} />}
                    placeholder={t('selectYear', 'Select year')}
                    items={yearOptions}
                    itemToString={(item: { id: string; label: string }) => item?.label ?? ''}
                    selectedItem={yearOptions.find((y) => y.id === estimatedYear) ?? null}
                    onChange={({ selectedItem }: { selectedItem: { id: string; label: string } | null }) =>
                      setEstimatedYear(selectedItem?.id ?? '')
                    }
                    invalid={Boolean(errors.startDateTime)}
                    invalidText={errors.startDateTime?.message}
                  />
                </ResponsiveWrapper>
                <ResponsiveWrapper>
                  <ComboBox
                    id="estimatedMonth"
                    titleText={t('monthOptional', 'Month (optional)')}
                    placeholder={t('selectMonth', 'Select month (optional)')}
                    items={monthOptions}
                    itemToString={(item: { id: string; label: string }) => item?.label ?? ''}
                    selectedItem={monthOptions.find((m) => m.id === estimatedMonth) ?? null}
                    onChange={({ selectedItem }: { selectedItem: { id: string; label: string } | null }) =>
                      setEstimatedMonth(selectedItem?.id ?? '')
                    }
                  />
                </ResponsiveWrapper>
              </div>
            </FormGroup>
          )}

          <FormGroup legendText={t('endDateAndTime', 'End date and time')}>
            <Controller
              name="endDateTime"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <DatePicker
                    datePickerType="single"
                    onChange={(event) => {
                      field.onChange(event[0]);
                    }}
                    value={field.value}>
                    <DatePickerInput
                      placeholder="mm/dd/yyyy"
                      labelText={t('endDate', 'End Date')}
                      id="endDateTime"
                      size="md"
                      invalid={!!fieldState.error}
                      invalidText={fieldState.error?.message}
                    />
                  </DatePicker>
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('imagingDuration', 'Imaging duration')}>
            <div className={styles.twoColumnGroup}>
              <Controller
                name="duration"
                control={control}
                render={({ field: { onChange, value, ref, name }, fieldState }) => (
                  <ResponsiveWrapper>
                    <NumberInput
                      id="duration"
                      name={name}
                      ref={ref}
                      label={t('durationValue', 'Duration')}
                      placeholder={t('enterDuration', 'Enter duration')}
                      min={1}
                      hideSteppers
                      allowEmpty
                      invalid={Boolean(fieldState.error)}
                      invalidText={fieldState.error?.message}
                      value={value ?? ''}
                      onChange={(_event, { value: nextValue }: { value: number | string }) => {
                        if (nextValue == null || nextValue === '') {
                          onChange(null);
                          return;
                        }
                        const parsed = typeof nextValue === 'number' ? nextValue : Number(nextValue);
                        onChange(Number.isNaN(parsed) ? null : parsed);
                      }}
                    />
                  </ResponsiveWrapper>
                )}
              />
              <Controller
                name="durationUnit"
                control={control}
                render={({ field, fieldState }) => (
                  <ResponsiveWrapper>
                    <ComboBox
                      id="durationUnit"
                      titleText={t('durationUnit', 'Duration unit')}
                      placeholder={t('selectDurationUnit', 'Select unit')}
                      items={durationUnitOptions}
                      itemToString={(item: ConceptReference) => item?.display ?? ''}
                      selectedItem={durationUnitOptions.find((option) => option.uuid === field.value) ?? null}
                      onChange={({ selectedItem }: { selectedItem: ConceptReference | null }) =>
                        field.onChange(selectedItem?.uuid ?? null)
                      }
                      invalid={Boolean(fieldState.error)}
                      invalidText={fieldState.error?.message}
                    />
                  </ResponsiveWrapper>
                )}
              />
              {durationUnitOptionsError && (
                <p className={styles.errorMessage}>
                  {t('durationUnitOptionsLoadFailed', 'Could not load duration unit options. Please try again.')}
                </p>
              )}
            </div>
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('status', 'Status')} />}>
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <ComboBox
                    id="status"
                    titleText=""
                    aria-label={t('status', 'Status')}
                    placeholder={t('selectStatus', 'Select status')}
                    items={statusOptions}
                    itemToString={(item: ConceptReference) => item?.display ?? ''}
                    selectedItem={statusOptions.find((option) => option.uuid === field.value) ?? null}
                    onChange={({ selectedItem }: { selectedItem: ConceptReference | null }) =>
                      field.onChange(selectedItem?.uuid ?? null)
                    }
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
            {statusOptionsError && (
              <p className={styles.errorMessage}>
                {t('statusOptionsLoadFailed', 'Could not load status options. Please try again.')}
              </p>
            )}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('imagingOutcome', 'Imaging outcome')} />}>
            <Controller
              name="outcomeCoded"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <ComboBox
                    id="outcomeCoded"
                    titleText=""
                    aria-label={t('outcome', 'Outcome')}
                    placeholder={t('selectOutcome', 'Select outcome')}
                    items={outcomeOptions}
                    itemToString={(item: { id: string; label: string }) => item?.label ?? ''}
                    selectedItem={outcomeOptions.find((option) => option.id === field.value) ?? null}
                    onChange={({ selectedItem }: { selectedItem: { id: string; label: string } | null }) =>
                      field.onChange(selectedItem?.id ?? '')
                    }
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('participants', 'Participants')}>
            <div className={styles.tagsContainer}>
              {selectedParticipants.map((participant) => (
                <Tag key={participant.uuid} type="blue" className={styles.tag}>
                  {participant.display}
                  <button
                    type="button"
                    className={styles.tagClose}
                    onClick={() => handleParticipantRemove(participant)}>
                    ×
                  </button>
                </Tag>
              ))}
            </div>
            <Search
              id="participantsSearch"
              placeholder={t('searchParticipants', 'Search participants')}
              labelText={t('participants', 'Participants')}
              value={providerSearchTerm}
              onChange={(e) => {
                setProviderSearchTerm(e.target.value);
                setShowParticipants(true);
              }}
              onClear={() => {
                setProviderSearchTerm('');
                setShowParticipants(false);
              }}
            />
            {showParticipants && providerSearchResults?.length > 0 && (
              <div className={styles.searchResults}>
                {providerSearchResults.map((provider) => (
                  <div
                    key={provider.uuid}
                    className={styles.searchResultItem}
                    onClick={() => handleParticipantSelect(provider)}>
                    {provider.display}
                  </div>
                ))}
              </div>
            )}
            {isProviderSearching && <InlineLoading description={t('loading', 'Loading') + '...'} />}
          </FormGroup>

          <FormGroup legendText={t('complications', 'Complications')}>
            <div className={styles.tagsContainer}>
              {selectedComplications.map((complication) => (
                <Tag key={complication.concept.uuid} type="red" className={styles.tag}>
                  {complication.display}
                  <button
                    type="button"
                    className={styles.tagClose}
                    onClick={() => handleComplicationRemove(complication)}>
                    ×
                  </button>
                </Tag>
              ))}
            </div>
            <Search
              id="complicationsSearch"
              placeholder={t('searchComplications', 'Search complications')}
              labelText={t('complications', 'Complications')}
              value={conditionSearchTerm}
              onChange={(e) => {
                setConditionSearchTerm(e.target.value);
                setShowComplications(true);
              }}
              onClear={() => {
                setConditionSearchTerm('');
                setShowComplications(false);
              }}
            />
            {showComplications && conditionSearchResults?.length > 0 && (
              <div className={styles.searchResults}>
                {conditionSearchResults.map((condition) => (
                  <div
                    key={condition.concept.uuid}
                    className={styles.searchResultItem}
                    onClick={() => handleComplicationSelect(condition)}>
                    {condition.display}
                  </div>
                ))}
              </div>
            )}
            {isConditionSearching && <InlineLoading description={t('loading', 'Loading') + '...'} />}
          </FormGroup>

          <FormGroup legendText={t('notes', 'Notes')}>
            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="notes"
                    labelText=""
                    placeholder={t('enterNotes', 'Enter notes (optional)')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          {/* Imaging Observation Fields */}
          <FormGroup legendText={t('imagingModality', 'Imaging Modality')}>
            <Controller
              name="imagingModality"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <ComboBox
                    id="imagingModality"
                    titleText=""
                    placeholder={t('selectModality', 'Select modality (CT, MRI, US, X-ray, etc.)')}
                    items={[]} // TODO: Load modality options from config
                    itemToString={(item) => item?.display ?? ''}
                    onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid ?? '')}
                    value={field.value}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('contrastAgent', 'Contrast Agent')}>
            <Controller
              name="contrastAgent"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <ComboBox
                    id="contrastAgent"
                    titleText=""
                    placeholder={t('selectContrast', 'Select contrast agent')}
                    items={[]} // TODO: Load contrast options from config
                    itemToString={(item) => item?.display ?? ''}
                    onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid ?? '')}
                    value={field.value}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('accessionNumber', 'Accession Number')}>
            <Controller
              name="accessionNumber"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="accessionNumber"
                    labelText=""
                    placeholder={t('enterAccessionNumber', 'Enter accession number')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('dicomStudyUid', 'DICOM Study UID')}>
            <Controller
              name="dicomStudyUid"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="dicomStudyUid"
                    labelText=""
                    placeholder={t('enterDicomUid', 'Enter DICOM Study UID')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('radiationDose', 'Radiation Dose')}>
            <Controller
              name="radiationDose"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <NumberInput
                    {...field}
                    id="radiationDose"
                    label=""
                    placeholder={t('enterDose', 'Enter radiation dose (mSv)')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('clinicalIndication', 'Clinical Indication')}>
            <Controller
              name="clinicalIndication"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="clinicalIndication"
                    labelText=""
                    placeholder={t('enterIndication', 'Enter clinical indication/reason for imaging')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('imagingFindings', 'Imaging Findings')}>
            <Controller
              name="imagingFindings"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="imagingFindings"
                    labelText=""
                    placeholder={t('enterFindings', 'Enter detailed radiology findings')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                    rows={8}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('imagingImpression', 'Imaging Impression')} />}>
            <Controller
              name="imagingImpression"
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="imagingImpression"
                    labelText=""
                    placeholder={t('enterImpression', 'Enter radiologist impression/conclusion')}
                    invalid={Boolean(fieldState.error)}
                    invalidText={fieldState.error?.message}
                    rows={4}
                  />
                </ResponsiveWrapper>
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('imagingImages', 'Image Attachments')}>
            <Tile className={styles.tile}>
              <p className={styles.tileText}>
                {t('imageAttachmentsPlaceholder', 'Image attachment functionality will be added here.')}
              </p>
            </Tile>
          </FormGroup>
        </Stack>
      </div>
      <div className={styles.submitButtons}>
        {errorSaving ? (
          <div className={styles.errorContainer}>
            <InlineNotification
              role="alert"
              kind="error"
              lowContrast
              title={t('errorSavingImaging', 'Error saving imaging')}
              subtitle={errorSaving?.message}
            />
          </div>
        ) : null}
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
            {isSubmittingForm ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
};

const RequiredFieldLabel = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <span>
      {label}
      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </span>
  );
};

export default ImagingResultFormComponent;
