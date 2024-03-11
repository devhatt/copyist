import { Command } from '../interfaces';

export default class AddCommand implements Command {
    private $elements: HTMLElement[];
    private $parent: HTMLElement;

    constructor($parent: HTMLElement, $elements: HTMLElement[]) {
        this.$elements = $elements;
        this.$parent = $parent;
    }

    do() {
        this.$elements.forEach(($element) => this.$parent.appendChild($element));
    }

    undo() {
        this.$elements.forEach(($element) => $element.remove());
    }
}
