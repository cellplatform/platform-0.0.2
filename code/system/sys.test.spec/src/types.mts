import type { Transform } from './TestSuite.helpers/Transform.mjs';
import type { Tree } from './TestSuite.helpers/Tree.mjs';
import type { t } from './common.t';

export type * from './TestSuite.helpers/types.mjs';

type Id = string;
type SuiteId = Id;
type TestId = Id;
type Anything = void | any;
type Milliseconds = number;
type Ctx = Record<string, unknown>;
type IgnoredResponse = any | Promise<any>;

export type TestModifier = 'skip' | 'only';

export type BundleImport = TestSuiteModel | SpecImport | Promise<any>;
export type SpecImport = Promise<{ default: TestSuiteModel }>;
export type SpecImports = { [namespace: string]: () => SpecImport };

/**
 * BDD ("behavior driven develoment") style test configuration API.
 */
export type Test = {
  Is: TestIs;
  Tree: typeof Tree;
  describe: TestSuiteDescribe;
  bundle(items: BundleImport | BundleImport[]): Promise<TestSuiteModel>;
  bundle(description: string, items: BundleImport | BundleImport[]): Promise<TestSuiteModel>;
  run(items: BundleImport | BundleImport[]): Promise<TestSuiteRunResponse>;
  run(description: string, items: BundleImport | BundleImport[]): Promise<TestSuiteRunResponse>;
  using: typeof Transform;
};

export type TestIs = {
  promise(input?: any): boolean;
  test(input?: any): boolean;
  suite(input?: any): boolean;
};

/**
 * A suite ("set") of tests.x
 */
export type TestSuite = {
  id: SuiteId;
  timeout(value: Milliseconds): TestSuite;
  describe: TestSuiteDescribe;
  it: TestSuiteIt;
};

export type TestSuiteDescribe = TestSuiteDescribeDef & {
  skip: TestSuiteDescribeDef;
  only: TestSuiteDescribeDef;
};
export type TestSuiteDescribeDef = (
  description: string,
  handler?: TestSuiteHandler,
) => TestSuiteModel;

export type TestSuiteIt = TestSuiteItDef & { skip: TestSuiteItDef; only: TestSuiteItDef };
export type TestSuiteItDef = (description: string, handler?: TestHandler) => TestModel;

export type TestSuiteHandler = (e: TestSuite) => Anything | Promise<Anything>;
export type TestHandler = (e: TestHandlerArgs) => Anything | Promise<Anything>;
export type TestHandlerArgs = {
  id: TestId;
  description: string;
  timeout(value: Milliseconds): TestHandlerArgs;
  ctx?: Ctx;
};

/**
 * Model: Test
 */
export type TestModel = {
  kind: 'Test';
  parent: TestSuiteModel;
  id: TestId;
  run: TestRun;
  description: string;
  handler?: TestHandler;
  modifier?: TestModifier;
  clone(): TestModel;
  toString(): string;
};

export type TestRun = (options?: TestRunOptions) => Promise<TestRunResponse>;
export type TestRunOptions = {
  timeout?: Milliseconds;
  excluded?: TestModifier[];
  ctx?: Ctx;
  before?: BeforeRunTest;
  after?: AfterRunTest;
  noop?: boolean; // Produces a result without executing any of the actual test function.
};
export type TestRunResponse = {
  id: TestId;
  tx: Id; // Unique ID for the individual test run operation.
  ok: boolean;
  description: string;
  elapsed: Milliseconds;
  timeout: Milliseconds;
  excluded?: TestModifier[];
  error?: Error;
  noop?: boolean;
};

/**
 * Model: Test Suite
 */

export type TestSuiteModel = TestSuite & {
  readonly kind: 'TestSuite';
  readonly state: TestSuiteModelState;
  readonly description: string;
  readonly ready: boolean; // true after [init] has been run.
  run: TestSuiteRun;
  merge(...suites: TestSuiteModel[]): Promise<TestSuiteModel>;
  init(): Promise<TestSuiteModel>;
  clone(): Promise<TestSuiteModel>;
  walk(handler: (e: t.SuiteWalkDownArgs) => void): void;
  hash(algo?: 'SHA1' | 'SHA256'): string;
  toString(): string;
};

export type TestSuiteModelState = {
  parent?: TestSuiteModel;
  ready: boolean; // true after [init] has been run.
  description: string;
  handler?: TestSuiteHandler;
  tests: TestModel[];
  children: TestSuiteModel[];
  timeout?: Milliseconds;
  modifier?: TestModifier;
};

export type TestSuiteRun = (options?: TestSuiteRunOptions) => Promise<TestSuiteRunResponse>;
export type TestSuiteRunOptions = {
  timeout?: number;
  deep?: boolean;
  ctx?: Ctx;
  only?: TestModel['id'][]; // Override: a set of spec IDs to filter on, excluding all others.
  beforeEach?: BeforeRunTest;
  afterEach?: AfterRunTest;
  noop?: boolean; // Produces a result-tree without executing any of the actual test functions.
};
export type TestSuiteRunResponse = {
  id: SuiteId;
  tx: Id; // Unique ID for the individual suite run operation.
  ok: boolean;
  description: string;
  elapsed: Milliseconds;
  tests: TestRunResponse[];
  children: TestSuiteRunResponse[];
  stats: TestSuiteRunStats;
  noop?: boolean;
};

export type TestSuiteRunStats = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  only: number;
};

/**
 * Handlers that run before/after a test is run.
 */
export type BeforeRunTest = (e: BeforeRunTestArgs) => IgnoredResponse;
export type BeforeRunTestArgs = {
  id: TestId;
  description: string;
};

export type AfterRunTest = (e: AfterRunTestArgs) => IgnoredResponse;
export type AfterRunTestArgs = {
  id: TestId;
  description: string;
  result: t.TestRunResponse;
};
};
