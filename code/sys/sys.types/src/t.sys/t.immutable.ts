import type { t } from '../common';

/**
 * Immutable object with mutator change function.
 */
export type Immutable<T, P = unknown> = {
  readonly current: T;
  change(fn: ImmutableMutator<T>, options?: ImmutableChangeOptions<P>): void;
};

/**
 * Immutable change/mutator functions.
 */
export type ImmutableMutator<T> = (draft: T) => void;

export type ImmutablePatchCallback<P> = (patches: P[]) => void;
export type ImmutableChangeOptions<P> =
  | ImmutablePatchCallback<P>
  | { patches?: ImmutablePatchCallback<P> };

/**
 * A reference handle to an Immutable<T> with
 * an observable event factory.
 */
export type ImmutableRef<T, E = unknown, P = unknown> = Immutable<T, P> & {
  readonly instance: string; // Unique ID of the reference handle.
  events(dispose$?: t.UntilObservable): E;
};

/**
 * Generic immutable events observer.
 *
 * See example reference implementation in:
 *   sys.util → Immutable.events(💥):💦
 *
 */
export type ImmutableEvents<
  T,
  P,
  C extends ImmutableChange<T, P> = ImmutableChange<T, P>,
> = t.Lifecycle & { readonly changed$: t.Observable<C> };

export type ImmutableChange<T, P> = {
  readonly before: T;
  readonly after: T;
  readonly patches: P[];
};
