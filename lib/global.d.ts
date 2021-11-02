/* eslint-disable @typescript-eslint/no-explicit-any */

import ReactInstance from "react";
import ReactDOMInstance from "react-dom";

declare global {
    namespace BdApi {
        const Patcher: any;
    }

    type React = typeof ReactInstance;
    type ReactDOM = typeof ReactDOMInstance;
}
