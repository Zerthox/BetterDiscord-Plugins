declare module "*.module.scss" {
    const classNames: Record<string, string>;
    export default classNames;
    export const css: string;
}

declare module "*.scss" {
    const css: string;
    export default css;
}
