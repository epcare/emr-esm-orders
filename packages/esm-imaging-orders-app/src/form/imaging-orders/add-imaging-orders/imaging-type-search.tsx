import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, Search, SkeletonText, Tile } from '@carbon/react';
import { ArrowRight, ShoppingCartArrowDown, ShoppingCartArrowUp } from '@carbon/react/icons';
import {
  useDebounce,
  useLayoutType,
  useSession,
  ResponsiveWrapper,
  useWorkspace2Context,
} from '@openmrs/esm-framework';
import { useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { prepImagingOrderPostData } from '../api';
import { type ImagingType, useImagingTypes } from './useImagingTypes';
import { createEmptyImagingOrder } from './imaging-order';
import styles from './imaging-type-search.scss';
import { type ImagingOrderBasketItem } from '../../../types';

export interface TestTypeSearchProps {
  openImagingForm: (searchResult: ImagingOrderBasketItem) => void;
  patient: fhir.Patient | null;
}

export function TestTypeSearch({ openImagingForm, patient }: TestTypeSearchProps) {
  const { t } = useTranslation();
  // this search screen is a child workspace of the order basket, so going
  // "back to the basket" simply means closing this workspace
  const { closeWorkspace } = useWorkspace2Context();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value ?? '');
  };

  return (
    <>
      <ResponsiveWrapper>
        <Search
          autoFocus
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for an imaging test')}
          labelText={t('searchFieldPlaceholder', 'Search for an imaging test')}
          onChange={handleSearchTermChange}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <TestTypeSearchResults
        searchTerm={debouncedSearchTerm}
        openOrderForm={openImagingForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
        patient={patient}
      />
    </>
  );
}

interface TestTypeSearchResultsProps {
  searchTerm: string;
  openOrderForm: (searchResult: ImagingOrderBasketItem) => void;
  focusAndClearSearchInput: () => void;
  patient: fhir.Patient | null;
}

function TestTypeSearchResults({
  searchTerm,
  openOrderForm,
  focusAndClearSearchInput,
  patient,
}: TestTypeSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  // this search screen is a child workspace of the order basket, so going
  // "back to the basket" simply means closing this workspace
  const { closeWorkspace } = useWorkspace2Context();
  const { testTypes, isLoading, error } = useImagingTypes(searchTerm);

  if (isLoading) {
    return <TestTypeSearchSkeleton />;
  }

  if (error) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>
            {t('errorFetchingTestTypes', 'Error fetching results for "{{searchTerm}}"', {
              searchTerm,
            })}
          </h4>
          <p className={styles.bodyShort01}>
            <span>{t('trySearchingAgain', 'Please try searching again')}</span>
          </p>
        </div>
      </Tile>
    );
  }

  return (
    <>
      {testTypes?.length ? (
        <div className={styles.container}>
          {searchTerm && (
            <div className={styles.orderBasketSearchResultsHeader}>
              <span className={styles.searchResultsCount}>
                {t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
                  count: testTypes?.length,
                  searchTerm,
                })}
              </span>
              <Button kind="ghost" onClick={focusAndClearSearchInput} size={isTablet ? 'md' : 'sm'}>
                {t('clearSearchResults', 'Clear Results')}
              </Button>
            </div>
          )}
          <div className={styles.resultsContainer}>
            {testTypes.map((testType) => (
              <TestTypeSearchResultItem
                key={testType.conceptUuid}
                testType={testType}
                openOrderForm={openOrderForm}
                patient={patient}
              />
            ))}
          </div>
        </div>
      ) : (
        <Tile className={styles.emptyState}>
          <div>
            <h4 className={styles.productiveHeading01}>
              {t('noResultsForTestTypeSearch', 'No results to display for "{{searchTerm}}"', {
                searchTerm,
              })}
            </h4>
            <p className={styles.bodyShort01}>
              <span>{t('tryTo', 'Try to')}</span>{' '}
              <span className={styles.link} role="link" tabIndex={0} onClick={focusAndClearSearchInput}>
                {t('searchAgain', 'search again')}
              </span>{' '}
              <span>{t('usingADifferentTerm', 'using a different term')}</span>
            </p>
          </div>
        </Tile>
      )}
      <hr className={classNames(styles.divider, isTablet ? styles.tabletDivider : styles.desktopDivider)} />
      {isTablet && (
        <div className={styles.separatorContainer}>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <Button kind="ghost" onClick={() => closeWorkspace()}>
            {t('returnToOrderBasket', 'Return to order basket')}
          </Button>
        </div>
      )}
    </>
  );
}

interface TestTypeSearchResultItemProps {
  testType: ImagingType;
  openOrderForm: (searchResult: ImagingOrderBasketItem) => void;
  patient: fhir.Patient | null;
}

const TestTypeSearchResultItem: React.FC<TestTypeSearchResultItemProps> = ({ testType, openOrderForm, patient }) => {
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  // this search screen is a child workspace of the order basket, so going
  // "back to the basket" simply means closing this workspace
  const { closeWorkspace } = useWorkspace2Context();
  const { orders, setOrders } = useOrderBasket<ImagingOrderBasketItem>(
    patient ?? ({ id: '' } as fhir.Patient),
    'imaging',
    prepImagingOrderPostData,
  );
  const testTypeAlreadyInBasket = useMemo(
    () => orders?.some((order) => order.testType.conceptUuid === testType.conceptUuid),
    [orders, testType],
  );

  const createImagingOrder = useCallback(
    (testType: ImagingType) => {
      return createEmptyImagingOrder(testType, session.currentProvider.uuid);
    },
    [session.currentProvider?.uuid],
  );

  const { t } = useTranslation();

  const addToBasket = useCallback(() => {
    const imagingOrder = createImagingOrder(testType);
    imagingOrder.isOrderIncomplete = true;
    setOrders([...orders, imagingOrder]);
    closeWorkspace();
  }, [orders, setOrders, createImagingOrder, testType, closeWorkspace]);

  const removeFromBasket = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== testType.conceptUuid));
  }, [orders, setOrders, testType.conceptUuid]);

  return (
    <Tile
      className={classNames(styles.searchResultTile, {
        [styles.tabletSearchResultTile]: isTablet,
      })}
      key={testType.conceptUuid}
      role="listitem">
      <div className={classNames(styles.searchResultTileContent, styles.text02)}>
        <p>
          <span className={styles.productiveHeading01}>{testType.label}</span>{' '}
        </p>
      </div>
      <div className={styles.searchResultActions}>
        {testTypeAlreadyInBasket ? (
          <Button
            kind="danger--ghost"
            renderIcon={(props) => <ShoppingCartArrowUp size={16} {...props} />}
            onClick={() => removeFromBasket()}>
            {t('removeFromBasket', 'Remove from basket')}
          </Button>
        ) : (
          <Button
            kind="ghost"
            renderIcon={(props) => <ShoppingCartArrowDown size={16} {...props} />}
            onClick={() => addToBasket()}>
            {t('directlyAddToBasket', 'Add to basket')}
          </Button>
        )}
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={() => openOrderForm(createImagingOrder(testType))}>
          {t('goToDrugOrderForm', 'Order form')}
        </Button>
      </div>
    </Tile>
  );
};

const TestTypeSearchSkeleton = () => {
  const isTablet = useLayoutType() === 'tablet';
  const tileClassName = `${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
    styles.skeletonTile
  }`;
  return (
    <div className={styles.searchResultSkeletonWrapper}>
      <div className={styles.orderBasketSearchResultsHeader}>
        <SkeletonText className={styles.searchResultCntSkeleton} />
        <ButtonSkeleton size={isTablet ? 'md' : 'sm'} />
      </div>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <hr className={classNames(styles.divider, isTablet ? styles.tabletDivider : styles.desktopDivider)} />
    </div>
  );
};
