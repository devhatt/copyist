export type SelectHandler<T> = (selected: T) => void;
export type UnselectHandler<T> = (unselected: T) => void;
export type ClearHandler<T> = (cleared: T[]) => void;

export default class Selection<T> {
    private _items: Set<T>;

    events = {
        select: new Set<SelectHandler<T>>(),
        unselect: new Set<UnselectHandler<T>>(),
        clear: new Set<ClearHandler<T>>(),
    };

    constructor() {
        this._items = new Set();
    }

    get items() {
        return this._items as ReadonlySet<T>;
    }

    clear() {
        if (this._items.size === 0) return;

        const elements = Array.from(this._items);
        this._items.clear();
        this.events.clear.forEach((callback) => callback(elements));
    }

    select(element: T) {
        const exists = this._items.has(element);
        if (exists) return;

        this._items.add(element);
        this.events.select.forEach((callback) => callback(element));
    }

    unselect(element: T) {
        const exists = this._items.has(element);
        if (!exists) return;

        this._items.delete(element);
        this.events.unselect.forEach((callback) => callback(element));
    }

    toggle(element: T) {
        if (this._items.has(element)) this.unselect(element);
        else this.select(element);
    }
}
