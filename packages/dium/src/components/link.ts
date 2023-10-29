import {Filters, Finder} from "../api";

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

interface Links {
    Link: React.ForwardRefExoticComponent<LinkProps>;
    NavLink: React.ForwardRefExoticComponent<any>;
    LinkRouter: React.ComponentClass<any, any>;
}

export const {Link, NavLink, LinkRouter}: Links = /* @__PURE__ */ Finder.demangle({
    NavLink: Filters.bySource(".sensitive", ".to"),
    Link: Filters.bySource(".component", ".to"),
    LinkRouter: Filters.bySource("this.history")
}, ["NavLink", "Link"]);
