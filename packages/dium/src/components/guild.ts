import { Finder } from "../api";

export const GuildsNav: React.MemoExoticComponent<React.FunctionComponent<any>> = /* @__PURE__ */ Finder.bySource(
    ["guildsnav"],
    { entries: true },
);

export const GuildItem: React.MemoExoticComponent<React.FunctionComponent<any>> = /* @__PURE__ */ Finder.bySource([
    "folderNode",
    ".isFolderExpanded",
]);

export const HomeButton: React.FunctionComponent<any> = /* @__PURE__ */ Finder.bySource(
    ["unviewedTrialCount", "unviewedDiscountCount"],
    { entries: true },
);
