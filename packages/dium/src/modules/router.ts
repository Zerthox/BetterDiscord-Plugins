import {Filters, Finder} from "../api";

type ReactRouter = typeof import("react-router");

type Keys = "Redirect" | "Route" | "Router" | "Switch" | "matchPath" | "useHistory" | "useLocation" | "useParams" | "useRouteMatch" | "withRouter" | "__RouterContext";

export type Router = Pick<ReactRouter, Keys>;

const mapping = {
    Redirect: Filters.bySource(".computedMatch", ".to"),
    Route: Filters.bySource(".computedMatch", ".location"),
    Router: Filters.byKeys("computeRootMatch"),
    Switch: Filters.bySource(".cloneElement"),
    useLocation: Filters.bySource(").location"),
    useParams: Filters.bySource(".params:"),
    withRouter: Filters.bySource("withRouter("),
    __RouterContext: Filters.byName("Router")
};

export const Router: Pick<Router, keyof typeof mapping> = /* @__PURE__ */ Finder.demangle(mapping, ["withRouter"]);
