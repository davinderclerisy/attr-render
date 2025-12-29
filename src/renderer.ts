import { evaluateExpression } from './utils';
import { RenderOptions } from './types';

// We define a minimal interface for what we need from the DOM
// Using 'any' for DOM nodes to avoid strict type battles with Domino/standard libs
// but we'll try to use standard names where possible.

export async function processNode(
    node: any, 
    context: any, 
    globalContext: any, 
    options: RenderOptions
): Promise<void> {
    if (node.nodeType !== 1) { // Node.ELEMENT_NODE = 1
        return;
    }

    const element = node;

    // 1. Process js-if / js-if-not
    if (element.hasAttribute('js-if')) {
        const expr = element.getAttribute('js-if');
        const result = evaluateExpression(expr, context, globalContext);
        if (options.removeJsAttributes) element.removeAttribute('js-if');
        
        if (!result) {
            element.parentNode?.removeChild(element);
            return; // Stop processing this node
        }
    }

    if (element.hasAttribute('js-if-not')) {
        const expr = element.getAttribute('js-if-not');
        const result = evaluateExpression(expr, context, globalContext);
        if (options.removeJsAttributes) element.removeAttribute('js-if-not');

        if (result) {
            element.parentNode?.removeChild(element);
            return; // Stop processing this node
        }
    }

    // 2. Process js-each
    if (element.hasAttribute('js-each')) {
        const expr = element.getAttribute('js-each');
        // Syntax: "item in items"
        const match = expr.match(/^\s*(\w+)\s+in\s+(.+)\s*$/);
        
        if (options.removeJsAttributes) element.removeAttribute('js-each');

        if (match) {
            const [_, varName, listExpr] = match;
            const list = evaluateExpression(listExpr, context, globalContext);
            const parent = element.parentNode;

            if (parent && Array.isArray(list)) {
                // We create a fragment to hold new items to minimize reflows (conceptually)
                // domino might not care about reflows but good practice.
                
                // We need to remove the original element acting as template
                // parent.removeChild(element); // MOVED TO END

                // We are essentially effectively "replacing" the element with the list
                // To keep order, we should insert before a reference, but we just removed it.
                // Wait, if we removed it, we lost our position.
                // Better: keep it as a placeholder, insert before, then remove.
                // But simplified:
                
                // Actually, let's step back.
                // We shouldn't remove it yet.
                const nextSibling = element.nextSibling; // reference for insertion if needed? 
                                                         // Actually removing and appending to parent might shuffle if not careful.
                                                         // But standard loop is: insert clones before template, then remove template.
                
                // Re-insert element if we removed it? No, I haven't executed removal line above yet.
                // Let's rewrite the flow.
                
                for (const item of list) {
                    const clone = element.cloneNode(true);
                    
                    // Remove js-each from clone to avoid infinite recursion
                    clone.removeAttribute('js-each'); 
                    
                    // Create child context
                    const childContext = Object.create(context);
                    childContext[varName] = item;
                    
                    // Insert before the template element
                    parent.insertBefore(clone, element);
                    
                    // Recursive process
                    await processNode(clone, childContext, globalContext, options);
                }
                
                // Finally remove the template element
                parent.removeChild(element);
                
                return; // Done with this node and its replacements' sub-trees
            } else {
                // List is not array or invalid? Remove element? 
                // Usually if empty or invalid, we render nothing.
                parent.removeChild(element);
                return;
            }
        }
    }

    // 3. Process js-value (Content)
    if (element.hasAttribute('js-value')) {
        const expr = element.getAttribute('js-value');
        const result = evaluateExpression(expr, context, globalContext);
        if (options.removeJsAttributes) element.removeAttribute('js-value');
        
        // Replace content
        element.textContent = result !== undefined && result !== null ? String(result) : '';
    }

    // 4. Process js-attr-*
    // We collect attributes to iterate to avoid issues if we modify attributes while iterating
    const attrs = Array.from(element.attributes as {name: string, value: string}[]);
    for (const attr of attrs) {
        if (attr.name.startsWith('js-attr-')) {
            const targetAttr = attr.name.substring('js-attr-'.length);
            const expr = attr.value;
            const result = evaluateExpression(expr, context, globalContext);
            
            if (options.removeJsAttributes) element.removeAttribute(attr.name);
            
            if (result !== undefined && result !== null && result !== false) {
                element.setAttribute(targetAttr, String(result));
            }
        }
    }

    // 5. Recursion for children
    // Note: If js-value was processed, children might be gone.
    // Also, iterate over a static list of children because children might change? 
    // js-each inside children will modify the list.
    // So `Array.from(element.children)` is safe snapshot?
    // Be careful: if a child expands into 5 siblings, they are siblings of the *child*, so they stay inside *this* element.
    // Yes, `element.children` is correct.
    
    // Convert to array to freeze the list, but if a child removes itself, it's fine.
    // If a child adds siblings... `processNode` handles `js-each` by replacing itself with siblings.
    // But those new siblings need processing. 
    // My previous `js-each` logic calls processNode on the clones recursively.
    // So the loop in the parent only sees the *template* child.
    // If I snapshot `children`, I process the template child.
    // The template child expands. 
    // Wait.
    
    // Scenario:
    // <div>
    //   <p js-each="..."></p>
    // </div>
    //
    // Parent is div. Children snapshot: [p].
    // Loop hits p. calls processNode(p).
    // processNode(p) sees js-each.
    //   -> Creates p1, p2. Inserts them before p.
    //   -> Recursively calling processNode(p1), processNode(p2).
    //   -> Removes p.
    //   -> Returns.
    // Loop continues. List finished.
    // Result: <div> p1 p2 </div>. Correct.
    
    const children = Array.from(element.children);
    for (const child of children) {
        await processNode(child, context, globalContext, options);
    }
}
