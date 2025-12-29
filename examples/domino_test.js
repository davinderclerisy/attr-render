const domino = require('domino');

function debug() {
    console.log('Testing domino insertBefore');
    const html = '<ul><li id="params"></li></ul>';
    const doc = domino.createWindow(html).document;
    const ul = doc.querySelector('ul');
    const li = doc.querySelector('li');
    
    console.log('UL children:', ul.children.length);
    console.log('LI parent:', li.parentNode.nodeName);
    
    // Simulate logic
    for (let i = 0; i < 2; i++) {
        const clone = li.cloneNode(true);
        console.log(`Inserting clone ${i} before LI`);
        try {
            ul.insertBefore(clone, li);
        } catch (e) {
            console.error('Error inserting:', e);
        }
    }
    
    console.log('UL children after:', ul.children.length);
    ul.removeChild(li);
    console.log('UL children final:', ul.children.length);
}

debug();
