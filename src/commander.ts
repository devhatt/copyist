import { Command } from './interfaces';

export default class Commander {
    private _undo: Command[] = [];
    private _redo: Command[] = [];

    do(command: Command) {
        command.do();
        this._undo.push(command);
        this._redo.length = 0;
    }

    undo() {
        const command = this._undo.pop();
        if (command == null) return;

        this._redo.push(command);
        command.undo();
    }

    redo() {
        const command = this._redo.pop();
        if (command == null) return;

        command.do();
        this._undo.push(command);
    }
}
