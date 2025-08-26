import { Finder } from "../api";
import { Embed as MessageEmbed } from "../modules/message";

export interface EmbedProps {
    embed?: MessageEmbed;
    className?: string;
    allowFullScreen?: boolean;
    autoPlayGif?: boolean;
    hideMedia?: boolean;
    maxMediaHeight?: number;
    maxMediaWidth?: number;
    maxThumbnailHeight?: number;
    maxThumbnailWidth?: number;
    spoiler?: boolean;
    onSuppressEmbed?: (event: React.MouseEvent) => void;
    renderTitle: (embed: MessageEmbed, title: string) => React.JSX.Element;
    renderDescription: (embed: MessageEmbed, description: string) => React.JSX.Element;
    renderLinkComponent: React.FunctionComponent<any>;
    renderImageComponent: React.FunctionComponent<any>;
    renderVideoComponent: React.FunctionComponent<any>;
}

export interface Embed extends React.ComponentClass<EmbedProps, any> {
    defaultProps: {
        allowFullScreen: true;
        hideMedia: false;
        maxMediaHeight: 300;
        maxMediaWidth: 400;
        maxThumbnailHeight: 80;
        maxThumbnailWidth: 80;
        spoiler: false;
    };
}

export const Embed: Embed = /* @__PURE__ */ Finder.byProtos(["renderSuppressButton"], { entries: true });
