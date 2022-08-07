import { Observable } from 'rxjs';
export declare type Constructable = new (...args: unknown[]) => unknown;
export declare type DecoratedFunc = any | Promise<any> | Observable<any>;
