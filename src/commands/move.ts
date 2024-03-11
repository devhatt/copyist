import { Command, Point } from '../interfaces';

export default class MoveCommand implements Command {
    private $elements: HTMLElement[];
    private delta: Point;

    constructor($elements: HTMLElement[], delta: Point) {
        this.$elements = $elements;
        this.delta = delta;
    }

    do() {
        this.$elements.forEach(($element) => {
            const left = +$element.style.left.replace('px', ''); // TODO: review
            const top = +$element.style.top.replace('px', ''); // TODO: review

            $element.style.left = left + this.delta.x + 'px'; // TODO: review
            $element.style.top = top + this.delta.y + 'px'; // TODO: review
        });
    }

    undo() {
        this.$elements.forEach(($element) => {
            const left = +$element.style.left.replace('px', ''); // TODO: review
            const top = +$element.style.top.replace('px', ''); // TODO: review

            $element.style.left = left - this.delta.x + 'px'; // TODO: review
            $element.style.top = top - this.delta.y + 'px'; // TODO: review
        });
    }
}
