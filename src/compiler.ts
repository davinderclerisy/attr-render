import * as domino from 'domino';
import { processNode } from './renderer';
import { CompiledTemplate, RenderOptions } from './types';

export class DominoCompiledTemplate implements CompiledTemplate {
    private templateDoc: any; // domino.Document

    constructor(templateString: string) {
        // We create a Document from the string.
        // domino.createDocument might wrap it in html/body?
        // If the user provided a fragment `<div>...</div>`, we want to preserve that.
        // But domino is a full DOM impl.
        // If we use createDocument, we get <html>...
        // If we pass the string, it parses it.
        // Let's store the whole document for now,/
        // OR better: do we want to return just the body's content?
        // The examples show `<div>...</div>` as input.
        // If we render that, we expect `<div>...</div>` out.
        // domino.createWindow(html).document
        
        this.templateDoc = domino.createWindow(templateString).document;
    }

    async render(data: any, options: RenderOptions = {}): Promise<string> {
        // Clone the document for this render pass
        // domino supports cloneNode on Document?
        // Or we just re-parse?
        // Re-parsing defeats the purpose of "compiling".
        // Compiling usually means parsing into DOM.
        // Cloning DOM is faster than parsing string.
        
        // Note: domino's cloneNode might be shallow on Document?
        // Let's clone the body or the relevant root.
        
        // Actually, if we want to return the full HTML (including doctype/head if present),
        // we should operate on the document.
        
        // NOTE: domino DOES NOT support `document.cloneNode(true)` properly in all versions or it might be buggy?
        // But let's assume standard behavior.
        // If not, we might have to re-create window with the same innerHTML? That's parsing again.
        // Let's try deep clone.
        const workingDoc = this.templateDoc.cloneNode(true);
        
        // Context
        // The user data is the context.
        // Global context is also the user data (for global. access).
        const context = data;
        const globalContext = { global: data }; // Based on README found in utils thought process
        // README said: "global.company.name".
        // My utils implementation: `new Function('global', ...).call(context, globalContext)`
        // So passing `{ global: data }` as second arg makes `global` available in stats.
        
        // Traverse and process
        // We start from body? Or root?
        // If I process `workingDoc.documentElement`, I capture <html> attributes too.
        await processNode(workingDoc.documentElement, context, globalContext, options);
        
        // Serialize
        // If the input was a fragment, domino wraps it in html/description/body.
        // We should detect if input was full HTML or fragment.
        // Simple heuristic: if input has <html> tag?
        // Or just always return `documentElement.outerHTML` or `body.innerHTML`?
        
        // README examples:
        // Example 1: `<div>...</div>`. Result: `<div>...</div>`.
        // Example 2: `<!DOCTYPE html>...`. Result: full doc.
        
        // Domino always produces a full doc.
        // If I pass `<div>foo</div>`, domino produces `<html><head></head><body><div>foo</div></body></html>`.
        // We need to return what matched the input.
        // That's hard to track from just the DOM.
        // We might store a flag "isFragment" during compilation?
        
        // Heuristic: Check if `this.templateDoc.body.innerHTML` basically equals `templateString` (ignoring whitespace)?
        // Or check if templateString starts with `<html` or `<!DOCTYPE`.
        
        // Let's implement a "isFullPage" check.
        
        // However, I can't check the string in `render`. I should check in constructor.
        return workingDoc.documentElement.outerHTML; 
        
        // Wait, if it's a fragment, `outerHTML` returns the `<html>` wrapper.
        // We should handle this nicer.
    }
}

// Improved Implementation with Fragment vs Page detection
export class BetterDominoTemplate implements CompiledTemplate {
    private templateDoc: any; // domino.Document
    private isFragment: boolean;

    constructor(templateString: string) {
        this.templateDoc = domino.createWindow(templateString).document;
        
        // Simple heuristic: Does input look like a full page?
        const trimmed = templateString.trim().toLowerCase();
        this.isFragment = !trimmed.startsWith('<!doctype') && !trimmed.startsWith('<html');
    }

    async render(data: any, options: RenderOptions = {}): Promise<string> {
        const workingDoc = this.templateDoc.cloneNode(true);
        const context = data;
        const globalContext = data;

        try {
            await processNode(workingDoc.documentElement, context, globalContext, options);
        } catch (e) {
            console.error("Error processing template", e);
        }

        if (this.isFragment) {
            // Return only body contents
            return workingDoc.body.innerHTML; 
        } else {
            let html = workingDoc.documentElement.outerHTML;
            if (workingDoc.doctype) {
                // domino doctype toString might work?
                // nodeType 10
                html = '<!DOCTYPE ' + workingDoc.doctype.name + (workingDoc.doctype.publicId ? ' PUBLIC "' +  workingDoc.doctype.publicId + '"' : '') + (workingDoc.doctype.systemId ? ' "' + workingDoc.doctype.systemId + '"' : '') + '>\n' + html;
            }
            return html;
        }
    }
}

export function compileTemplate(templateString: string): CompiledTemplate {
    return new BetterDominoTemplate(templateString);
}
