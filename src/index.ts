import Application from './application';

const app = new Application();
document.body.prepend(app.$element);

const $markdown = document.getElementById('markdown') as HTMLTextAreaElement;
const $send = document.getElementById('send')!;

$send.addEventListener('click', () => {
    const content = $markdown.value;
    app.renderMarkdown(content);
});
