const { compileTemplate } = require('../dist/index');
const assert = require('assert');

// Helper to normalize HTML for comparison (removes extra whitespace)
function normalize(html) {
    return html.replace(/>\s+</g, '><').trim();
}

async function runComplexTest() {
    console.log('Starting Complex Test...');

    const template = `
    <div id="catalog">
        <h1 js-value="store.name"></h1>
        <ul class="categories">
            <li js-each="cat in store.categories">
                <span js-value="cat.name"></span>
                <div js-if="cat.products.length > 0">
                    <table class="products">
                        <tr js-each="prod in cat.products" js-attr-class="prod.stock ? 'in-stock' : 'out-of-stock'">
                            <td js-value="prod.name"></td>
                            <td js-value="global.currency + prod.price"></td>
                            <td>
                                <span js-if="prod.stock > 0">In Stock (<span js-value="prod.stock"></span>)</span>
                                <span js-if-not="prod.stock > 0">Out of Stock</span>
                            </td>
                            <td>
                                Tags:
                                <span js-each="tag in prod.tags">
                                    <span class="tag" js-attr-data-tag="tag" js-value="tag"></span>
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
                <div js-if-not="cat.products.length > 0">
                    No products in <span js-value="cat.name"></span>.
                </div>
            </li>
        </ul>
    </div>
    `;

    const data = {
        currency: '$',
        store: {
            name: "SuperStore",
            categories: [
                {
                    name: "Electronics",
                    products: [
                        { name: "Laptop", price: 999, stock: 5, tags: ["work", "portable"] },
                        { name: "Mouse", price: 20, stock: 0, tags: ["accessory"] }
                    ]
                },
                {
                    name: "Books",
                    products: [] 
                },
                {
                    name: "Furniture",
                    products: [
                        { name: "Chair", price: 150, stock: 10, tags: ["home", "office", "wood"] }
                    ]
                }
            ]
        }
    };

    const expected = `
    <div id="catalog">
        <h1>SuperStore</h1>
        <ul class="categories">
            <li>
                <span>Electronics</span>
                <div>
                    <table class="products">
                        <tbody>
                        <tr class="in-stock">
                            <td>Laptop</td>
                            <td>$999</td>
                            <td>
                                <span>In Stock (<span>5</span>)</span>
                            </td>
                            <td>
                                Tags:
                                <span><span class="tag" data-tag="work">work</span></span>
                                <span><span class="tag" data-tag="portable">portable</span></span>
                            </td>
                        </tr>
                        <tr class="out-of-stock">
                            <td>Mouse</td>
                            <td>$20</td>
                            <td>
                                <span>Out of Stock</span>
                            </td>
                            <td>
                                Tags:
                                <span><span class="tag" data-tag="accessory">accessory</span></span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </li>
            <li>
                <span>Books</span>
                <div>
                    No products in <span>Books</span>.
                </div>
            </li>
            <li>
                <span>Furniture</span>
                <div>
                    <table class="products">
                        <tbody>
                        <tr class="in-stock">
                            <td>Chair</td>
                            <td>$150</td>
                            <td>
                                <span>In Stock (<span>10</span>)</span>
                            </td>
                            <td>
                                Tags:
                                <span><span class="tag" data-tag="home">home</span></span>
                                <span><span class="tag" data-tag="office">office</span></span>
                                <span><span class="tag" data-tag="wood">wood</span></span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </li>
        </ul>
    </div>
    `;

    const compiled = compileTemplate(template);
    const result = await compiled.render(data, { removeJsAttributes: true });

    const normalizedResult = normalize(result);
    const normalizedExpected = normalize(expected);

    try {
        assert.strictEqual(normalizedResult, normalizedExpected);
        console.log('✅ Complex Test PASSED');
        console.log('Output matched expectation perfectly.');
    } catch (e) {
        console.error('❌ Complex Test FAILED');
        console.error('--- Expected ---');
        console.error(normalizedExpected);
        console.error('--- Actual ---');
        console.error(normalizedResult);
        throw e;
    }
}

runComplexTest().catch(e => {
    console.error(e);
    process.exit(1);
});
