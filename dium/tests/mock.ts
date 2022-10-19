(global as any).TESTING = true;

(global as any).BdApi = {
    Webpack: {
        getModule: () => null
    },
    Plugins: {
        get: () => ({})
    }
} as any;
