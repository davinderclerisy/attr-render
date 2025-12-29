const { compileTemplate } = require('../dist/index');

const template = `
<div js-each="user in users">
    <h2 js-value="user.name"></h2>
    <p>Company: <span js-value="global.company"></span></p>
    <ul>
        <li js-each="role in user.roles">
            <span js-value="role"></span> (User: <span js-value="user.name"></span>)
        </li>
    </ul>
</div>
`;

const compiled = compileTemplate(template);

const data = {
    company: 'Tech Corp',
    users: [
        { name: 'Alice', roles: ['Admin', 'Dev'] },
        { name: 'Bob', roles: ['User'] }
    ]
};

compiled.render(data, { removeJsAttributes: true }).then(console.log);
