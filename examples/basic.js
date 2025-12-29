const { renderTemplate } = require('../dist/index');

const template = `
<div>
    <h1>Hello <span js-value="name"></span>!</h1>
    <p js-if="isAdmin">Welcome Admin</p>
</div>
`;

const data = {
    name: 'World',
    isAdmin: true
};

renderTemplate(template, data, true).then(html => {
    console.log(html);
});
