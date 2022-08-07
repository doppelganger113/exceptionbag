import { Observable } from 'rxjs';

export type Constructable = new (...args: unknown[]) => unknown;
export type DecoratedFunc = any | Promise<any> | Observable<any>;
