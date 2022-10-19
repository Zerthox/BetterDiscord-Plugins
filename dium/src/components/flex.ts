import {Finder} from "../api";

interface FlexProps {
    children?: React.ReactNode;
    className?: string;
    direction?: string;
    justify?: string;
    align?: string;
    wrap?: string;
    shrink?: number;
    grow?: number;
    basis?: string;
    style?: React.CSSProperties;
}

export interface Flex extends React.FunctionComponent<FlexProps> {
    Direction: {
        VERTICAL: string;
        HORIZONTAL: string;
        HORIZONTAL_REVERSE: string;
    };
    Justify: {
        AROUND: string;
        BETWEEN: string;
        CENTER: string;
        END: string;
        START: string;
    };
    Align: {
        STRETCH: string;
        START: string;
        END: string;
        CENTER: string;
        BASELINE: string;
    };
    Wrap: {
        NO_WRAP: string;
        WRAP: string;
        WRAP_REVERSE: string;
    };
    defaultProps: {
        shrink: 1;
        grow: 1;
        basis: "auto";
    };
    Child: React.FunctionComponent<any>;
}

export const Flex: Flex = /* @__PURE__ */ Finder.byProps(["Child", "Justify"], {entries: true});
