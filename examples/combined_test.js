const { renderTemplate, compileTemplate } = require('../dist/index');

async function runTests() {
    console.log('--- Test 1: Direct Rendering ---');
    const t1 = `<div><p js-value="name"></p></div>`;
    const d1 = { name: 'Direct Render' };
    const r1 = await renderTemplate(t1, d1, true);
    console.log('Template:', t1);
    console.log('Data:', JSON.stringify(d1));
    console.log('Result:', r1);
    if (r1.includes('Direct Render') && !r1.includes('js-value')) console.log('PASS');
    else console.error('FAIL');

    console.log('\n--- Test 2: Compile & Render (Conditionals) ---');
    const t2 = `
        <div js-if="show">Shown</div>
        <div js-if="!show">Hidden</div>
        <div js-if-not="show">Hidden (if-not)</div>
    `;
    const c2 = compileTemplate(t2);
    const splitCheck = (str) => str.replace(/\s+/g, '');
    
    const r2a = await c2.render({ show: true }, { removeJsAttributes: true });
    console.log('Result (True):', r2a.trim());
    if (r2a.includes('Shown') && !r2a.includes('Hidden')) console.log('PASS'); 
    else console.error('FAIL');

    const r2b = await c2.render({ show: false }, { removeJsAttributes: true });
    console.log('Result (False):', r2b.trim());
    if (!r2b.includes('Shown') && r2b.includes('Hidden') && r2b.includes('if-not')) console.log('PASS');
    else console.error('FAIL');

    console.log('\n--- Test 3: Loops & Scope ---');
    const t3 = `
        <ul>
            <li js-each="item in items">
                <span js-value="item.id"></span>: <span js-value="item.name"></span> (Parent: <span js-value="global.parentName"></span>)
            </li>
        </ul>
    `;
    const d3 = { 
        parentName: 'Root',
        items: [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ]
    };
    const r3 = await renderTemplate(t3, d3, true);
    console.log('Result:', r3.replace(/\s+/g, ' '));
    if (r3.includes('1: A') && r3.includes('2: B') && r3.includes('Parent: Root')) console.log('PASS');
    else console.error('FAIL');

    console.log('\n--- Test 4: Attributes ---');
    const t4 = `<a js-attr-href="url" js-attr-target="target">Link</a>`;
    const d4 = { url: 'http://example.com', target: '_blank' };
    const r4 = await renderTemplate(t4, d4, true);
    console.log('Result:', r4);
    if (r4.includes('href="http://example.com"') && r4.includes('target="_blank"')) console.log('PASS');
    else console.error('FAIL');
    
    console.log('\n--- Test 5: Full Page ---');
    const t5 = `<!DOCTYPE html><html><body><div js-value="msg"></div></body></html>`;
    const r5 = await renderTemplate(t5, { msg: 'Hello' }, true);
    console.log('Result:', r5);
    if (r5.includes('<!DOCTYPE') && r5.includes('Hello')) console.log('PASS');
    else console.error('FAIL - Check DOCTYPE or handling');
}

runTests().catch(console.error);
