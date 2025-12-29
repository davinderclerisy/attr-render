/**
 * Safely evaluates a JavaScript expression against a context object.
 * 
 * @param expression The JavaScript expression to evaluate (e.g., "user.name", "items.length > 0")
 * @param context The data object to be used as 'this' and scope
 * @param globalContext Optional global context to be accessible as 'global'
 * @returns The result of the evaluation
 */
export function evaluateExpression(expression: string, context: any, globalContext: any = {}): any {
    try {
        // Create a function that takes 'global' as an argument and executes with 'this' set to context
        // We use 'with(this)' to allow direct property access (e.g. 'name' instead of 'this.name')
        // However, 'with' is strict mode incompatible, so we stick to direct access or properties on 'this'
        // But users expect "user.name".
        
        // Strategy: We pass keys of context as arguments? No, that's dynamic.
        // Simple 'new Function' strategy:
        // wrapper function: (global) => { return [expression] }
        // executed with .call(context, globalContext)
        
        // To support "user.name" where user is a property of context:
        // If context is { user: ... }, then 'this.user' works.
        // But precise 'with' emulation is hard without 'with'.
        // Let's assume the user will likely use "user.name" and 'user' is in the data.
        
        // Actually, the most robust way without 'with' is using a Proxy or just simple Function execution 
        // effectively wrapping the code in a `with(this) { return ${expression} }` block.
        // Although 'with' is frowned upon, it is part of JS and valid in non-strict mode.
        // But modules are strict by default.
        
        // Alternative: Replace variable names? Too complex.
        // Alternative: function(data, global) { return data.user.name } <- requires parsing
        
        // Let's try the direct 'new Function' with destructuring if possible, or just expect expressions to match context structure?
        // The README examples show: `js-value="user.name"` and data is `{ user: ... }`.
        
        // If we do: new Function('global', 'return ' + expression).call(context, globalContext)
        // Then `this.user.name` would work. But `user.name` would ReferenceError unless `user` is global.
        
        // WAIT. JS template engines often use `with`.
        // 'new Function' does NOT inherit strict mode unless strictly defined.
        // So `with` might work inside `new Function`.
        
        const func = new Function('global', `with(this) { return (${expression}); }`);
        return func.call(context, globalContext);
    } catch (e) {
        console.warn(`Failed to evaluate expression: "${expression}"`, e);
        return undefined; // Or throw, or empty string
    }
}
