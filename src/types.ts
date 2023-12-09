import { Observable } from 'rxjs';

export type Constructable = new (...args: unknown[]) => unknown;
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-redundant-type-constituents */
export type DecoratedFunc = any | Promise<any> | Observable<any>;
