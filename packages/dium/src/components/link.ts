import {Filters, Finder} from "../api";
import type {Router} from "../modules";

export interface LinkProps extends Record<string, any> {
    component?: any;
    replace?: any;
    to?: any;
    innerRef?: React.Ref<any>;
    history?: any;
    location?: any;
    children?: React.ReactNode;
    className?: string;
    tabIndex?: number;
}

interface Links extends Omit<Router, "__RouterContext"> {
    BrowserRouter: React.ComponentClass<any, any>;
    Link: React.ForwardRefExoticComponent<LinkProps>;
}

const mapping = {
    Link: Filters.bySource(".component", ".to"),
    BrowserRouter: Filters.bySource("this.history")
    // NavLink: Filters.bySource(".sensitive", ".to"),
};

export const {Link, BrowserRouter}: Pick<Links, keyof typeof mapping> = /* @__PURE__ */ Finder.demangle(mapping, ["Link", "BrowserRouter"]);
