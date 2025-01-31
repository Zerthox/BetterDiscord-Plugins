import {Finder} from "../api";

export interface SliderProps extends Record<string, any> {
    initialValue?: number;
    maxValue?: number;
    minValue?: number;
    disabled?: boolean;
    handleSize?: number;
    keyboardStep?: number;
    asValueChanges?: any;
    stickToMarkers?: boolean;
    className?: string;
    children?: React.ReactNode;
    barStyles?: React.CSSProperties;
    fillStyles?: React.CSSProperties;
    mini?: any;
    hideBubble?: any;
    defaultValue?: any;
    orientation?: any;
    onValueRender?: any;
    renderMarker?: any;
    getAriaValueText?: any;
    barClassName?: string;
    grabberClassName?: string;
    grabberStyles?: any;
    markerPosition?: any;
    "aria-hidden"?: any;
    "aria-label"?: any;
    "aria-labelledby"?: any;
    "aria-describedby"?: any;
}

export interface SliderState extends Record<string, any> {
    value: any;
    active: any;
    focused: any;
    sortedMarkers: any;
    markerPositions: any;
    closestMarkerIndex: any;
    newClosestIndex: any;
    min: any;
    max: any;
}

export interface Slider extends React.ComponentClass<SliderProps, SliderState> {
    defaultProps: {
        disabled: false;
        fillStyles: Record<string, never>;
        handleSize: 10;
        initialValue: 10;
        keyboardStep: 1;
        maxValue: 100;
        minValue: 0;
        stickToMarkers: false;
    };
}

export const Slider: Slider = /* @__PURE__ */ Finder.bySource(["markerPositions:", "asValueChanges:"], {entries: true});
