import { compileTemplate } from './compiler';
import { RenderOptions } from './types';

export * from './types';
export * from './compiler';
/* 
   We don't export renderer directly as it's internal logic, 
   but we could if advanced users want 'processNode'.
   For now let's keep it private.
*/

/**
 * Compiles and renders a template in one step.
 * Useful for simple use cases where performance (caching) is not a concern.
 * 
 * @param template The HTML template string
 * @param data The data object for binding
 * @param removeJsAttributes Whether to remove js-* attributes (default: false) - Wait, boolean or options?
 *        The README example says: renderTemplate(html, data, true) -> boolean argument?
 *        Or options object? 
 *        README Line 69: `renderTemplate(htmlTemplate, data, true)`
 *        README Line 185: `renderTemplate` ... accept ... `options` (object).
 *        Contradiction? Or supports both?
 *        Let's support both for robustness.
 */
export async function renderTemplate(
    template: string, 
    data: any, 
    optionsOrRemove: RenderOptions | boolean = {}
): Promise<string> {
    const compiled = compileTemplate(template);
    
    let options: RenderOptions = {};
    if (typeof optionsOrRemove === 'boolean') {
        options = { removeJsAttributes: optionsOrRemove };
    } else {
        options = optionsOrRemove;
    }
    
    return compiled.render(data, options);
}
