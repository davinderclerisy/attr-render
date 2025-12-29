# attr-render

A JavaScript library for compiling and rendering HTML templates with dynamic content, conditional rendering, and iteration using `domino`. The logic is handled via custom HTML attributes such as `js-value`, `js-if`, `js-if-not`, `js-each`, and `js-attr-*`.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Direct Rendering](#direct-rendering)
  - [Compile and Render (Recommended)](#compile-and-render-recommended)
  - [TypeScript Support](#typescript-support)
  - [Options](#options)
- [Attributes](#attributes)
  - [js-value](#js-value)
  - [js-if](#js-if)
  - [js-if-not](#js-if-not)
  - [js-each](#js-each)
  - [js-attr-*](#js-attr-)
- [Global Context](#global-context)
- [Performance](#performance)
- [Examples](#examples)

## Installation

Install the package using npm:

```bash
npm install attr-render
```

## Usage

### Direct Rendering

For simple use cases, you can directly render a template:

```javascript
const { renderTemplate } = require('attr-render');

// Example HTML template
const htmlTemplate = `
    <div>
        <p js-value="user.name"></p>
        <p js-if="user.isAdmin">Admin Section</p>
    </div>
`;

const data = {
    user: {
        name: 'John Doe',
        isAdmin: true
    }
};

renderTemplate(htmlTemplate, data, true).then((renderedHtml) => {
    console.log(renderedHtml);
});
```

### Compile and Render (Recommended)

For better performance, compile once and render multiple times:

```javascript
const { compileTemplate } = require('attr-render');

const template = compileTemplate(htmlTemplate);
const html = await template.render(data, { removeJsAttributes: true });
```

### TypeScript Support

```typescript
import { compileTemplate, renderTemplate } from 'attr-render';
```

### Options

1. `data` (object): The data object.
2. `options` (object):
   - `removeJsAttributes` (boolean): Remove `js-*` attributes after rendering.

## Attributes

### js-value
Inserts dynamic content.
```html
<p js-value="user.name"></p>
```

### js-if / js-if-not
Conditionally renders elements.
```html
<p js-if="user.isAdmin">Admin</p>
<p js-if-not="user.loggedIn">Login</p>
```

### js-each
Iterates over arrays.
```html
<ul>
  <li js-each="item in items">
    <span js-value="item.name"></span>
  </li>
</ul>
```

### js-attr-*
Sets HTML attributes dynamically.
```html
<a js-attr-href="user.url">Link</a>
```

## Global Context

When iterating with `js-each`, a new scope is created for each item. To access the root data object from within a loop, use the `global.` prefix.

```html
<div js-each="user in users">
  <!-- 'user' is the current item, 'global.company' is from the root data -->
  <p><span js-value="user.name"></span> works at <span js-value="global.company"></span></p>
</div>
```

## Performance

`attr-render` uses `domino`, a lightweight DOM implementation, making it significantly faster than `jsdom` for server-side rendering.

- **Direct Rendering**: ~30ms (initialization overhead)
- **Pre-compiled Rendering**: ~4ms (highly efficient)

## Examples

### Nested Loops and Logic

```javascript
const { compileTemplate } = require('attr-render');

const template = `
<div id="catalog">
    <h1 js-value="store.name">TechStore</h1>
    <ul>
        <li js-each="cat in store.categories">
            <h3 js-value="cat.name">Laptop</h3>
            <table js-if="cat.products.length > 0">
                <tr js-each="prod in cat.products" js-attr-class="prod.stock ? 'in-stock' : 'out-of-stock'">
                    <td js-value="prod.name">Laptop</td>
                    <td js-value="global.currency + prod.price">$10</td>
                    <td>
                        <span js-if="prod.stock > 0">In Stock (<span js-value="prod.stock">10</span>)</span>
                        <span js-if-not="prod.stock > 0">Out of Stock</span>
                    </td>
                </tr>
            </table>
            <div js-if-not="cat.products.length > 0">
                No products available.
            </div>
        </li>
    </ul>
</div>
`;

const data = {
    currency: '$',
    store: {
        name: "TechStore",
        categories: [
            {
                name: "Laptops",
                products: [
                    { name: "ProBook", price: 1200, stock: 5 },
                    { name: "AirBook", price: 900, stock: 0 }
                ]
            },
            { name: "Accessories", products: [] }
        ]
    }
};

const compiled = compileTemplate(template);
compiled.render(data, { removeJsAttributes: true }).then(console.log);
```

## Known Limitations

1.  **Strict Variable Naming in Loops**:
    The `js-each` directive uses a strict format (`item in items`). Loop variables **must be alphanumeric** (e.g., `item`, `user1`). Special characters like `$` (e.g., `$item`) are not supported and will cause the expression to be ignored.

2.  **Global Variable Shadowing**:
    Variables in your data object shadow global JavaScript objects. For example, if you pass `{ Math: "some text" }` in your data, expressions like `Math.max(1, 2)` will fail because `Math` is now a string, not the global object. Avoid naming data properties after standard JS globals (Math, Date, JSON, etc.) if you intend to use them in expressions.

3.  **No Iteration over Objects/Sets/Maps**:
    `js-each` supports **Arrays only**. Iterating over Objects (`key in myObject`) or other iterables like Sets or Maps is not supported and will result in the element being removed.

4.  **Deep Property Access on Undefined**:
    Accessing a deep property on an undefined variable (e.g., `user.profile.age` where `profile` is undefined) will result in `undefined` (which evaluates to empty string or false). While safe, this silences errors that might indicate missing data.

5.  **Synchronous Evaluation**:
    All expressions are evaluated synchronously. `await` or Promise-based expressions are not supported in attributes.
