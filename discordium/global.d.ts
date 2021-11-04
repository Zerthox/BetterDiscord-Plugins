declare module "*.scss" {
    const contents: string;
    export default contents;
}

declare namespace BdApi {
    const Patcher: any;
    const injectCSS: (id: string, styles: string) => void;
    const clearCSS: (id: string) => void;
}
