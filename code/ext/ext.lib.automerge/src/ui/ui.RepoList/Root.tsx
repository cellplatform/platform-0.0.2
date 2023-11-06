import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Model } from '../ui.RepoList.Model';
import { RepoListRef } from './Ref';
import { DEFAULTS, type t } from './common';
import { View } from './ui';

/**
 * A list of Automerge repositories.
 */
export const RepoList = forwardRef<t.RepoListRef, t.RepoListProps>((props, ref) => {
  const { store } = props;

  const handleRef = useRef<t.RepoListRef>();
  const modelRef = useRef(Model.List.init(props.store));
  const model = modelRef.current;
  const { list, renderers } = model;

  const createHandle = () => (handleRef.current = RepoListRef({ list, store }));
  const getOrCreateHandle = () => handleRef.current || createHandle();

  useImperativeHandle(ref, getOrCreateHandle);
  useEffect(() => props.onReady?.(getOrCreateHandle()), []);

  return <View {...props} list={list} renderers={renderers} />;
});

/**
 * Meta
 */
RepoList.displayName = DEFAULTS.displayName;
