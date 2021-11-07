declare module "*.scss" {
    const contents: string;
    export default contents;
}

declare namespace BdApi {
    const Patcher: any;

    function alert(title: string, content: JSX.Element): void;

    function loadData(id: string, key: string): any;
    function saveData(id: string, key: string, data: any): void;
    function deleteData(id: string, key: string): void;

    function injectCSS(id: string, styles: string): void;
    function clearCSS(id: string): void;
}
