import path from "path";
import {writeFile} from "fs/promises";

interface UpdateInfo {
    url: string;
    file: string;
    source?: string;
    version?: string;
}

const fetchUpdate = async (id: number): Promise<UpdateInfo> => {
    const res = await fetch(`https://betterdiscord.app/gh-redirect?id=${id}`, {
        cache: "no-cache"
    });
    const urlParts = res.url.split("/");
    const file = urlParts[urlParts.length - 1];

    const source = await res.text();
    const meta = source.slice(0, source.indexOf("**/"));
    let version: string;
    for (const line of meta.split(/\n/)) {
        const match = line.match(/@version\s+(.+)/);
        if (match) {
            version = match[1];
        }
    }

    return {
        url: res.url,
        file,
        source,
        version
    };
};

const updatePlugin = async (name: string, content: string): Promise<void> => {
    const file = path.resolve(BdApi.Plugins.folder, name);
    await writeFile(file, content);
};

export const checkForUpdate = async (name: string, version: string, id?: number): Promise<void> => {
    if (typeof id === "number") {
        const info = await fetchUpdate(id);
        if (info.version !== version) {
            const close = BdApi.showNotice(`Update available for ${name}`, {buttons: [{
                label: "Update",
                onClick() {
                    close();
                    updatePlugin(info.file, info.source);
                }
            }]});
        }
    }
};
