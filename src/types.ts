export interface RenderOptions {
    removeJsAttributes?: boolean;
}

export interface CompiledTemplate {
    render(data: any, options?: RenderOptions): Promise<string>;
}
