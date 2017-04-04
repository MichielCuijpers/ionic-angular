import { Platform } from './platform';
/**
 * @private
 */
export declare class DomDebouncer {
    private dom;
    private writeTask;
    private readTask;
    constructor(dom: DomController);
    read(fn: DomCallback): Function;
    write(fn: DomCallback, ctx?: any): Function;
    cancel(): void;
}
/**
 * @private
 */
export declare class DomController {
    plt: Platform;
    private r;
    private w;
    private q;
    constructor(plt: Platform);
    debouncer(): DomDebouncer;
    read(fn: DomCallback, timeout?: number): any;
    write(fn: DomCallback, timeout?: number): any;
    cancel(fn: any): void;
    private _queue();
    private _flush(timeStamp);
}
/**
 * @private
 */
export declare type DomCallback = {
    (timeStamp?: number): void;
};