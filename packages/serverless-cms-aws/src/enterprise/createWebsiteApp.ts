import {
    createWebsitePulumiApp,
    CreateWebsitePulumiAppParams
} from "@webiny/pulumi-aws/enterprise";
import { PluginCollection } from "@webiny/plugins/types";
import { generateCommonHandlers, renderWebsite } from "~/website/plugins";
import { uploadAppToS3 } from "~/react/plugins";
import { pbLegacyRenderingWarningPlugins } from "~/utils/pbLegacyRenderingWarning";

export interface CreateWebsiteAppParams extends CreateWebsitePulumiAppParams {
    plugins?: PluginCollection;
}

export function createWebsiteApp(projectAppParams: CreateWebsiteAppParams = {}) {
    const builtInPlugins = [
        uploadAppToS3({ folder: "apps/website" }),
        generateCommonHandlers,
        renderWebsite,
        pbLegacyRenderingWarningPlugins
    ];

    const customPlugins = projectAppParams.plugins ? [...projectAppParams.plugins] : [];

    return {
        id: "website",
        name: "Website",
        description: "Your project's public website.",
        cli: {
            // Default args for the "yarn webiny watch ..." command (we don't need the deploy option while developing).
            watch: {
                deploy: false
            }
        },
        pulumi: createWebsitePulumiApp(projectAppParams),
        plugins: [builtInPlugins, customPlugins]
    };
}
