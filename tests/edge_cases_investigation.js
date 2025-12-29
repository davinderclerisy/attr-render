const { renderTemplate } = require('../dist/index');

async function testEdgeCases() {
    console.log("Investigating Edge Cases...\n");

    const template = `
    <!-- Case 1: Deep undefined access -->
    <div id="case-1" js-if="user.profile.details.age > 18">Deep Access</div>
    
    <!-- Case 2: Accessing non-existent top-level var -->
    <div id="case-2" js-value="nonExistentVar">Should be empty</div>

    <!-- Case 3: Global variable shadowing -->
    <!-- We inject 'Math' in data. If shadowing works, this will fail or print string -->
    <div id="case-3" js-value="Math">Shadowing Math</div>
    <div id="case-3b" js-value="Math.max(10, 20)">Math.max</div>

    <!-- Case 4: js-each with special chars in variable name -->
    <ul id="case-4">
        <li js-each="$item in items" js-value="$item">Item</li>
    </ul>

    <!-- Case 5: js-each over non-array (object) -->
    <ul id="case-5">
        <li js-each="key in objectData">Object Item</li>
    </ul>
    
    <!-- Case 6: js-each over null/undefined -->
    <ul id="case-6">
        <li js-each="item in nullData">Null Item</li>
    </ul>

     <!-- Case 7: Syntax error in expression -->
    <div id="case-7" js-if="user.age > ">Syntax Error</div>
    `;

    const data = {
        user: { 
            // profile is missing
        },
        items: ['A', 'B'],
        objectData: { a: 1, b: 2 },
        nullData: null,
        Math: "I am not Math object"
    };

    try {
        const output = await renderTemplate(template, data);
        console.log("--- Render Output (Partial) ---");
        console.log(output);
        console.log("-------------------------------");
    } catch (e) {
        console.error("Critical Render Failure:", e);
    }
}

testEdgeCases();
