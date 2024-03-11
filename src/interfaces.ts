export type Point = {
    x: number;
    y: number;
};

export type ReadonlyPoint = {
    readonly x: number;
    readonly y: number;
};

export interface Command {
    do(): void;
    undo(): void;
}
