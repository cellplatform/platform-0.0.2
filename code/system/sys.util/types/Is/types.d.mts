export declare type Is = IsFlags & IsMethods;
export declare type IsFlags = {
    browser: boolean;
    node: boolean;
};
export declare type IsMethods = {
    stream(input?: any): boolean;
    observable(input?: any): boolean;
    subject(input?: any): boolean;
    promise(input?: any): boolean;
    plainObject(input?: any): boolean;
    blank(input?: any): boolean;
    json(input?: any): boolean;
};
