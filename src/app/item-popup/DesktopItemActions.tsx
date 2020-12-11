import { settingsSelector } from 'app/dim-api/selectors';
import { useHotkey } from 'app/hotkeys/useHotkey';
import { t } from 'app/i18next-t';
import { DimItem } from 'app/inventory/item-types';
import { sortedStoresSelector } from 'app/inventory/selectors';
import { amountOfItem, getStore } from 'app/inventory/stores-helpers';
import {
  CompareActionButton,
  ConsolidateActionButton,
  DistributeActionButton,
  InfuseActionButton,
  LoadoutActionButton,
  LockActionButton,
  TagActionButton,
} from 'app/item-actions/ActionButtons';
import ItemMoveLocations from 'app/item-actions/ItemMoveLocations';
import { setSetting } from 'app/settings/actions';
import { AppIcon, maximizeIcon, minimizeIcon } from 'app/shell/icons';
import { RootState } from 'app/store/types';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './DesktopItemActions.m.scss';

const sidecarCollapsedSelector = (state: RootState) => settingsSelector(state).sidecarCollapsed;

const sharedButtonProps = { role: 'button', tabIndex: -1 };

export default function DesktopItemActions({ item }: { item: DimItem }) {
  const stores = useSelector(sortedStoresSelector);
  const dispatch = useDispatch();
  const sidecarCollapsed = useSelector(sidecarCollapsedSelector);
  const itemOwner = getStore(stores, item.owner);

  const toggleSidecar = () => {
    dispatch(setSetting('sidecarCollapsed', !sidecarCollapsed));
  };

  useHotkey('k', t('MovePopup.ToggleSidecar'), toggleSidecar);

  const containerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const reposition = () => {
      if (containerRef.current) {
        const parent = containerRef.current.closest('.item-popup');
        const arrow = parent?.querySelector('.arrow') as HTMLDivElement;
        if (!arrow || !parent) {
          return;
        }
        const arrowRect = arrow.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const containerHeight = containerRef.current.clientHeight;
        const offset = arrowRect.top - parentRect.top + 2.5;

        const top = _.clamp(offset - containerHeight / 2, 0, parent.clientHeight - containerHeight);

        containerRef.current.style.transform = `translateY(${Math.round(top)}px)`;
      }
    };

    reposition();
    setTimeout(reposition, 10);
  });

  if (!itemOwner) {
    return null;
  }

  const canConsolidate =
    !item.notransfer &&
    item.location.hasTransferDestination &&
    item.maxStackSize > 1 &&
    stores.some((s) => s !== itemOwner && amountOfItem(s, item) > 0);
  const canDistribute = item.destinyVersion === 1 && !item.notransfer && item.maxStackSize > 1;

  const showCollapse =
    item.taggable ||
    item.lockable ||
    item.trackable ||
    !item.notransfer ||
    item.comparable ||
    canConsolidate ||
    canDistribute ||
    item.equipment ||
    item.infusionFuel;

  return (
    <div
      className={clsx(styles.interaction, { [styles.collapsed]: sidecarCollapsed })}
      ref={containerRef}
    >
      {showCollapse && (
        <div
          className={styles.collapseButton}
          onClick={toggleSidecar}
          title={t('MovePopup.ToggleSidecar') + ' [K]'}
          {...sharedButtonProps}
        >
          <AppIcon icon={sidecarCollapsed ? maximizeIcon : minimizeIcon} />
        </div>
      )}

      <TagActionButton item={item} label={!sidecarCollapsed} />
      <LockActionButton item={item} label={!sidecarCollapsed} />
      <CompareActionButton item={item} label={!sidecarCollapsed} />
      <ConsolidateActionButton item={item} label={!sidecarCollapsed} />
      <DistributeActionButton item={item} label={!sidecarCollapsed} />
      <LoadoutActionButton item={item} label={!sidecarCollapsed} />
      <InfuseActionButton item={item} label={!sidecarCollapsed} />

      {!sidecarCollapsed && <ItemMoveLocations item={item} splitVault={true} />}
    </div>
  );
}
