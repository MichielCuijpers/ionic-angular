/**
 * @private
 */
export declare class Form {
    private _focused;
    private _ids;
    private _inputs;
    register(input: any): void;
    deregister(input: any): void;
    setAsFocused(input: any): void;
    /**
     * Focuses the next input element, if it exists.
     */
    tabFocus(currentInput: any): any;
    nextId(): number;
}
/**
 * @private
 */
export declare abstract class IonicTapInput implements IonicFormInput {
    abstract initFocus(): void;
    abstract checked: boolean;
    abstract disabled: boolean;
}
/**
 * @private
 */
export declare abstract class IonicFormInput {
    abstract initFocus(): void;
}
