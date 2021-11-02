/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "*.scss" {
    const contents: string;
    export default contents;
}

declare namespace BdApi {
    const Patcher: any;
}
