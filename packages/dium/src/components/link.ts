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
    NavLink: React.ForwardRefExoticComponent<any>;
}

const mapping = {
    NavLink: Filters.bySource(".sensitive", ".to"),
    Link: Filters.bySource(".component", ".to"),
    BrowserRouter: Filters.bySource("this.history")
};

export const {Link, NavLink, BrowserRouter}: Pick<Links, keyof typeof mapping> = /* @__PURE__ */ Finder.demangle(mapping, ["Link", "BrowserRouter"]);
