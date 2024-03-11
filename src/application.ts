import hljs from 'highlight.js';
import 'highlight.js/styles/default.min.css';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import './application.css';
import Commander from './commander';
import AddCommand from './commands/add';
import DeleteCommand from './commands/delete';
import MoveCommand from './commands/move';
import Mouse from './mouse';
import Selection from './selection';

function renderHTML(html: string) {
    const $element = document.createElement('div');
    $element.innerHTML = html;
    return Array.from($element.children);
}

const MOVABLE_SELECTOR = 'application__movable';
const SELECTED_SELECTOR = 'application__selected';
const CLONE_SELECTOR = 'application__clone';
const MOVING_SELECTOR = 'application__moving';

export default class Application {
    readonly $element: HTMLDivElement;

    private mouse = new Mouse();
    private selection = new Selection<HTMLElement>();
    private commander = new Commander();
    private selectedToClone: Map<HTMLElement, HTMLElement>;

    constructor() {
        this.$element = document.createElement('div');
        this.$element.classList.add('application');
        this.selectedToClone = new Map();

        this.init();
    }

    init() {
        this.$element.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('keydown', this.handleKeyDown); // TODO: review

        this.selection.events.select.add(($element) => {
            $element.classList.add(SELECTED_SELECTOR);
        });

        this.selection.events.unselect.add(($element) => {
            this.selectedToClone.delete($element);
            $element.classList.remove(SELECTED_SELECTOR);
        });

        this.selection.events.clear.add(($elements) => {
            this.selectedToClone.clear();
            $elements.forEach(($element) => $element.classList.remove(SELECTED_SELECTOR));
        });

        this.mouse.events.startMove.add(() => {
            this.selection.items.forEach(($element) => {
                const $clone = $element.cloneNode(true) as HTMLElement;
                this.selectedToClone.set($element, $clone);

                $element.classList.add(MOVING_SELECTOR);

                $clone.classList.remove(MOVABLE_SELECTOR);
                $clone.classList.add(CLONE_SELECTOR);

                this.$element.appendChild($clone);
            });
        });

        this.mouse.events.stopMove.add(() => {
            this.selection.items.forEach(($element) => $element.classList.remove(MOVING_SELECTOR));

            this.selectedToClone.forEach(($element) => {
                this.$element.removeChild($element);
            });
        });
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        const isPKey = e.code === 'KeyP';
        if (isPKey) {
            this.selection.items.forEach(($selected) => $selected.classList.remove(SELECTED_SELECTOR));

            html2canvas(this.$element, { scale: 1, logging: true }).then((canvas) => {
                const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                const link = document.createElement('a');
                link.download = 'canvas-image.png';
                link.href = image;
                link.click();
            });

            this.selection.items.forEach(($selected) => $selected.classList.add(SELECTED_SELECTOR));

            return;
        }

        const isUndoKey = e.code === 'KeyZ' && e.ctrlKey;
        if (isUndoKey) {
            this.commander.undo();
            return;
        }

        const isRedoKey = e.code === 'KeyY' && e.ctrlKey;
        if (isRedoKey) {
            this.commander.redo();
            return;
        }

        const isDeleteKey = e.code === 'Delete';
        if (isDeleteKey) {
            const command = new DeleteCommand(this.$element, Array.from(this.selection.items));
            this.commander.do(command);
            return;
        }
    };

    private handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;

        this.mouse.start(e.clientX, e.clientY);

        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
    };

    private handleMouseUp = (e: MouseEvent) => {
        if (e.button !== 0) return;

        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);

        const isSelection = e.ctrlKey;
        const isMoving = this.mouse.moving;
        this.mouse.stop(e.clientX, e.clientY);

        const $target = e.target as HTMLElement | null;
        const $closest = $target?.closest?.(`.${MOVABLE_SELECTOR}`) as HTMLElement;

        if (!isMoving) {
            if (!$closest) {
                if (!isSelection) this.selection.clear();
                return;
            }

            if (isSelection) {
                this.selection.toggle($closest);
                return;
            }

            this.selection.clear();
            this.selection.select($closest);

            return;
        }

        if (this.selection.items.size == 0) return;

        const command = new MoveCommand(Array.from(this.selection.items), {
            x: this.mouse.delta.x,
            y: this.mouse.delta.y,
        });
        this.commander.do(command);
    };

    private handleMouseMove = (e: MouseEvent) => {
        this.mouse.move(e.clientX, e.clientY);

        this.selectedToClone.forEach(($element) => {
            $element.style.translate = `${this.mouse.delta.x}px ${this.mouse.delta.y}px`;
        });
    };

    renderMarkdown(text: string) {
        const html = marked.parse(text) as string;

        const $elements = renderHTML(html);
        const $filtered = $elements.filter(($element) => $element instanceof HTMLElement) as HTMLElement[];

        requestAnimationFrame(() => {
            const wrapped = $filtered.map(($element) => ({ $element, boundary: $element.getBoundingClientRect() }));
            wrapped.forEach(({ $element, boundary }) => {
                $element.style.left = `${boundary.left}px`;
                $element.style.top = `${boundary.top}px`;

                $element.classList.add(MOVABLE_SELECTOR);
            });
        });

        const command = new AddCommand(this.$element, $filtered);
        this.commander.do(command);

        $filtered.forEach(($element) => {
            const isPre = $element.tagName === 'PRE';
            if (!isPre) return;

            const $codes = $element.querySelectorAll('code');
            if ($codes == null) return;

            $codes.forEach(($code) => hljs.highlightElement($code));
        });
    }
}
