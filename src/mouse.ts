export type StartMoveHandler = () => void;
export type StopMoveHandler = () => void;

export default class Mouse {
    threshold: number;

    private _initial: { x: number; y: number };
    private _delta: { x: number; y: number };
    private _final: { x: number; y: number };
    private _moving: boolean;

    events = {
        startMove: new Set<StartMoveHandler>(),
        stopMove: new Set<StopMoveHandler>(),
    };

    constructor(threshold = 10) {
        this._initial = { x: 0, y: 0 };
        this._delta = { x: 0, y: 0 };
        this._final = { x: 0, y: 0 };
        this._moving = false;
        this.threshold = threshold;
    }

    get initial() {
        return this._initial as Readonly<{ readonly x: number; readonly y: number }>;
    }

    get delta() {
        return this._delta as Readonly<{ readonly x: number; readonly y: number }>;
    }

    get final() {
        return this._final as Readonly<{ readonly x: number; readonly y: number }>;
    }

    get moving() {
        return this._moving;
    }

    private startMove() {
        if (this._moving) return;

        this._moving = true;
        this.events.startMove.forEach((callback) => callback());
    }

    private stopMove() {
        if (!this._moving) return;

        this._moving = false;
        this.events.stopMove.forEach((callback) => callback());
    }

    start(x = 0, y = x) {
        this._initial.x = x;
        this._initial.y = y;

        this._delta.x = 0;
        this._delta.y = 0;

        this._final.x = this._initial.x;
        this._final.y = this._initial.y;

        this.stopMove();
    }

    move(x = 0, y = x) {
        this._final.x = x;
        this._final.y = y;

        this._delta.x = this._final.x - this._initial.x;
        this._delta.y = this._final.y - this._initial.y;

        if (!this._moving) {
            const squared = Math.pow(this._delta.x, 2) + Math.pow(this._delta.y, 2);
            const hasMoved = Math.sqrt(squared) > this.threshold;

            if (!hasMoved) return;

            this.startMove();
        }
    }

    stop(x = 0, y = x) {
        this._final.x = x;
        this._final.y = y;

        this._delta.x = this._final.x - this._initial.x;
        this._delta.y = this._final.y - this._initial.y;

        this.stopMove();
    }
}
