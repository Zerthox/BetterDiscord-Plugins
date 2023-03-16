export * from "./channel";
export * from "./client";
export * from "./component-dispatch";
export * from "./experiment";
export * from "./flux";
export * from "./general";
export * from "./guild";
export * from "./message";
export * from "./npm";
export * from "./popout-window";
export * from "./router";
export * from "./user";

export type Untyped<T> = T & Record<string, any>;