const { renderTemplate, compileTemplate } = require('../dist/index');
const fs = require('fs');

// Example HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Renderer</title>
</head>
<body>

    <h1 js-value="user.name">example name</h1>
    <h1 js-value="user.email">example email</h1>
    <h2 js-if="user.isAdmin">Admin Section
        <span js-if="user.isSuperAdmin">Super Admin Section</span>
    </h2>
    <table border="1">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Admin</th>
        </tr>
        <tr js-each="user in users">
            <td js-value="user.name"></td>
            <td style="text-align: center" js-value="user.email"></td>
            <td>
                <table border="1">
                    <tr js-each="order in user.orders">
                        <td js-value="order.name">exmaple order name</td>
                        <td js-value="order.date">example order date</td>
                        <td js-value="global.user.name">example global name</td>
                        <td js-value="user.name">example user name</td>
                    </tr>
                </table>
            </td>
            <td style="text-align: center" js-if="user.isAdmin">Admin</td>
            <td style="text-align: center" js-if-not="user.isAdmin" js-value="user.name">example user name</td>
            <td style="text-align: center"><a js-attr-href="user.url">example url</a></td>
        </tr>
    </table>

</body>
</html>
`;

// Example data
const data = {
    user: { name: "John Doe", email: "john@example.com", isAdmin: true, isSuperAdmin: true },
    users: [
        {
            name: "Alice",
            email: "alice@example.com",
            isAdmin: true,
            orders: [
                { name: "Laptop", date: "2023-01-01" },
                { name: "Phone", date: "2023-02-01" }
            ],
            url: 'https://www.google.com'
        },
        {
            name: "Bob",
            email: "bob@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet", date: "2003-03-01" }],
            url: 'https://www.google.com'
        },
        {
            name: "Bob2",
            email: "bob3@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet3", date: "2013-03-01" }],
            url: 'https://www.google.com'
        },
        {
            name: "Bob3",
            email: "bob3@example.com",
            isAdmin: false,
            orders: [{ name: "Tablet3", date: "2033-03-01" }],
            url: 'https://www.google.com'
        }
    ]
};

// Example 1: Direct rendering (backward compatibility)
async function example1() {
    console.log("Example 1: Direct rendering");
    const start = Date.now();
    const renderedHtml = await renderTemplate(htmlTemplate, data, true);
    console.log(`Time taken: ${Date.now() - start}ms`);
    fs.writeFileSync(__dirname + '/output.html', renderedHtml);
}

// Example 2: Compile once, render multiple times (Handlebars-like approach)
async function example2() {
    console.log("Example 2: Compile once, render multiple times");
    
    // Compile the template (this would typically be done once and cached)
    const compilationStart = Date.now();
    const template = compileTemplate(htmlTemplate);
    console.log(`Compilation time: ${Date.now() - compilationStart}ms`);
    
    // Render with first data set
    const renderStart1 = Date.now();
    const renderedHtml1 = await template.render(data, { removeJsAttributes: true });
    console.log(`First render time: ${Date.now() - renderStart1}ms`);
    
    // Render with second data set (simulated by modifying the first)
    const data2 = JSON.parse(JSON.stringify(data)); // Deep clone
    data2.user.name = "Jane Smith";
    data2.users[0].name = "Carol";
    
    const renderStart2 = Date.now();
    const renderedHtml2 = await template.render(data2, { removeJsAttributes: true });
    console.log(`Second render time: ${Date.now() - renderStart2}ms`);
    
    // Save the second render result
    fs.writeFileSync(__dirname + '/output2.html', renderedHtml2);
}

// Run the examples
async function runExamples() {
    await example1();
    console.log("-------------------");
    await example2();
}

runExamples().catch(console.error);
