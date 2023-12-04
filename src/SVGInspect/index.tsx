import {createPlugin, Finder, React} from "dium";

const excludes = [".bodyWaveGradient", ".circleOverlay"];

const components = Finder.all.bySource([
    (source) => /\.(?:createElement|jsxs?)\)?\("svg",/.test(source) && !excludes.some((fragment) => source.includes(fragment))
], {entries: true});

interface ErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false};
    }
    render() {
        return !this.state.hasError ? this.props.children : null;
    }
    static getDerivedStateFromError() {
        return {hasError: true};
    }
}

export default createPlugin({
    SettingsPanel: () => (
        <>
            {components.map((SVG, i) => (
                <div key={i}>
                    <ErrorBoundary>
                        <SVG open/>
                    </ErrorBoundary>
                </div>
            ))}
        </>
    )
});
