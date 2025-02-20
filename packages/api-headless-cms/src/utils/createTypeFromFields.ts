import { createTypeName } from "~/utils/createTypeName";
import { renderField } from "~/utils/renderFields";
import { renderInputField } from "~/utils/renderInputFields";
import { ApiEndpoint, CmsFieldTypePlugins, CmsModel, CmsModelField } from "~/types";

interface TypeFromFieldParams {
    typeOfType: "type" | "input";
    model: CmsModel;
    type: ApiEndpoint;
    typeNamePrefix: string;
    fields: CmsModelField[];
    fieldTypePlugins: CmsFieldTypePlugins;
}

interface TypeFromFieldResponse {
    fieldType: string;
    typeDefs: string;
}

export const createTypeFromFields = (params: TypeFromFieldParams): TypeFromFieldResponse | null => {
    const { typeOfType, model, type, typeNamePrefix, fields, fieldTypePlugins } = params;
    const typeSuffix = typeOfType === "input" ? "Input" : "";
    const mTypeName = createTypeName(model.modelId);

    const typeFields = [];
    const nestedTypes = [];

    // Once the loop below starts, we'll be executing a recursive "object" type generation.
    // The main trick here is that nested objects don't know who the parent is, and will generate
    // type names using the "model", as if they're at the top level:
    // Every time the types are returned, we need to replace the model name in the generated type name
    // with the actual prefix which includes parent field name type.
    const replace = new RegExp(`${mTypeName}_`, "g");

    for (const f of fields) {
        const result =
            typeOfType === "type"
                ? renderField({ field: f, type, model, fieldTypePlugins })
                : renderInputField({ field: f, model, fieldTypePlugins });

        if (!result) {
            continue;
        }

        const { fields, typeDefs } = result;

        typeFields.push(fields.replace(replace, `${typeNamePrefix}_`));
        if (typeDefs) {
            nestedTypes.push(typeDefs.replace(replace, `${typeNamePrefix}_`));
        }
    }

    return {
        fieldType: `${typeNamePrefix}${typeSuffix}`,
        typeDefs: /* GraphQL */ `
            ${nestedTypes.join("\n")}

            ${typeOfType} ${typeNamePrefix}${typeSuffix} {
                ${typeFields.join("\n")}
            }
        `
    };
};
