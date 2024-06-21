import type { t, u } from './common';

type Tx = string;

/**
 * Generates a typed method function.
 * Overloads:
 *    - (req):      ← void
 *    - (req, res): ← responder
 */
export type CmdMethodFactory<C extends t.CmdType> = {
  <K extends C['name']>(req: K): CmdMethodVoid<u.CmdTypeMap<C>[K]>;

  <K extends C['name'], R extends C['name']>(req: K, res: R): CmdMethodResponder<
    u.CmdTypeMap<C>[K],
    u.CmdTypeMap<C>[R]
  >;
};

/**
 * Void Response.
 */
export type CmdMethodVoid<Req extends t.CmdType> = (
  params: Req['params'],
  options?: Tx | t.CmdInvokeOptions<Req>,
) => t.CmdInvoked<Req>;

/**
 * Listener Response.
 */
export type CmdMethodResponder<Req extends t.CmdType, Res extends t.CmdType> = (
  params: Req['params'],
  options?: Tx | t.CmdResponseHandler<Req, Res> | t.CmdInvokeResponseOptions<Req, Res>,
) => t.CmdResponseListener<Req, Res>;
