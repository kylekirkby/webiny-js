import { CoreOptions } from "medium-editor";
import { plugins } from "@webiny/plugins";
import { MediumEditorOptions, PbThemePlugin as PbThemePluginType } from "~/types";
import { isLegacyRenderingEngine } from "~/utils";
import { ThemePlugin } from "@webiny/app-theme";

export const getMediumEditorOptions = (
    defaultOptions: CoreOptions,
    mediumEditorOptions?: MediumEditorOptions
): CoreOptions => {
    if (typeof mediumEditorOptions === "function") {
        return mediumEditorOptions(defaultOptions);
    }
    return defaultOptions;
};

const getTypographyFromTheme = (type: string): string | undefined => {
    if (isLegacyRenderingEngine) {
        const [{ theme }] = plugins.byType<PbThemePluginType>("pb-theme");
        const themeElement = theme.elements[type];
        if (!themeElement) {
            console.warn(`No element of type: "${type}: found in theme.`);
            return "";
        }
        const { types } = themeElement;
        const [defaultType] = types;
        return defaultType.className;
    }

    const [{ theme }] = plugins.byType<ThemePlugin>(ThemePlugin.type);
    const { typography } = theme.styles;

    // We try either `{type}` or `{type}1`. If none found, the theme will be responsible for defining styles.
    if (type in typography) {
        return type;
    }

    const typeWithSuffix = [type, 1].join("");
    if (typeWithSuffix in typography) {
        return typeWithSuffix;
    }

    return undefined;
};

interface CreateInitialTextValueArgs {
    type: string;
    tag?: string;
    alignment?: string;
}

export const createInitialTextValue = ({
    type,
    alignment = "left",
    tag = "div"
}: CreateInitialTextValueArgs) => {
    // Get from theme object
    const typography = getTypographyFromTheme(type);

    return {
        type,
        typography,
        alignment,
        tag
    };
};
