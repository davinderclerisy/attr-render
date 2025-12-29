const { renderTemplate } = require('../dist/index');
const fs = require('fs');

async function testExpressions() {
    console.log("Testing Complex Expressions in js-if / js-if-not...");

    const htmlTemplate = `
    <div id="test-1" js-if="user.isAdmin && user.isActive">Shown: Admin and Active</div>
    <div id="test-2" js-if="user.isAdmin && !user.isActive">Hidden: Admin but Inactive</div>
    
    <div id="test-3" js-if="user.role === 'editor' || user.role === 'admin'">Shown: Editor or Admin</div>
    <div id="test-4" js-if="user.age >= 18">Shown: Adult</div>
    <div id="test-5" js-if="user.age < 18">Hidden: Minor</div>
    
    <div id="test-6" js-if="settings.features.beta && user.isBetaTester">Shown: Nested objects check</div>
    
    <div id="test-7" js-if-not="user.isBanned">Shown: Not Banned</div>
    <div id="test-8" js-if-not="!user.isBanned">Hidden: Double negative (Not Not Banned = Banned)</div>

    <div id="test-9" js-if="(user.score + 10) > 100">Shown: Math expression > 100</div>
    `;

    const data = {
        user: {
            isAdmin: true,
            isActive: true,
            role: 'editor',
            age: 25,
            isBetaTester: true,
            isBanned: false,
            score: 95
        },
        settings: {
            features: {
                beta: true
            }
        }
    };

    const start = Date.now();
    const renderedHtml = await renderTemplate(htmlTemplate, data);
    console.log(`Render time: ${Date.now() - start}ms`);
    
    console.log("\n--- Rendered Output ---");
    console.log(renderedHtml.trim());
    console.log("-----------------------\n");

    // Simple assertion logic
    const checks = [
        { id: "test-1", shouldExist: true, desc: "user.isAdmin && user.isActive" },
        { id: "test-2", shouldExist: false, desc: "user.isAdmin && !user.isActive" },
        { id: "test-3", shouldExist: true, desc: "user.role === 'editor' || user.role === 'admin'" },
        { id: "test-4", shouldExist: true, desc: "user.age >= 18" },
        { id: "test-5", shouldExist: false, desc: "user.age < 18" },
        { id: "test-6", shouldExist: true, desc: "settings.features.beta && user.isBetaTester" },
        { id: "test-7", shouldExist: true, desc: "js-if-not user.isBanned" },
        { id: "test-8", shouldExist: false, desc: "js-if-not !user.isBanned" },
        { id: "test-9", shouldExist: true, desc: "Math expression" }
    ];

    let passed = 0;
    let failed = 0;

    checks.forEach(check => {
        const exists = renderedHtml.includes(`id="${check.id}"`);
        if (exists === check.shouldExist) {
            console.log(`[PASS] ${check.desc}`);
            passed++;
        } else {
            console.log(`[FAIL] ${check.desc} - Expected ${check.shouldExist ? 'to exist' : 'not to exist'}, but got opposite.`);
            failed++;
        }
    });

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
}

testExpressions().catch(console.error);
