const { compileTemplate } = require('../dist/index');

const template = `
<ul>
    <li js-each="item in items" js-value="item"></li>
</ul>
`;

const compiled = compileTemplate(template);

async function run() {
    console.log('--- Run 1 ---');
    console.log(await compiled.render({ items: ['A', 'B'] }, { removeJsAttributes: true }));
    
    console.log('--- Run 2 ---');
    console.log(await compiled.render({ items: ['X', 'Y', 'Z'] }, { removeJsAttributes: true }));
}

run();
