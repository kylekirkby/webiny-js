import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHandler } from "@webiny/handler-aws/raw";
import i18nPlugins from "@webiny/api-i18n/graphql";
import i18nDynamoDbStorageOperations from "@webiny/api-i18n-ddb";
import i18nContentPlugins from "@webiny/api-i18n-content/plugins";
import {
    createPageBuilderGraphQL,
    createPageBuilderContext
} from "@webiny/api-page-builder/graphql";
import { createStorageOperations as createPageBuilderStorageOperations } from "@webiny/api-page-builder-so-ddb";
import pageBuilderImportExportPlugins from "@webiny/api-page-builder-import-export/graphql";
import { createStorageOperations as createPageBuilderImportExportStorageOperations } from "@webiny/api-page-builder-import-export-so-ddb";
import exportProcessPlugins from "@webiny/api-page-builder-import-export/export/process";
import dbPlugins from "@webiny/handler-db";
import { DynamoDbDriver } from "@webiny/db-dynamodb";
import dynamoDbPlugins from "@webiny/db-dynamodb/plugins";
import fileManagerPlugins from "@webiny/api-file-manager/plugins";
import fileManagerDynamoDbStorageOperation from "@webiny/api-file-manager-ddb";
import fileManagerS3 from "@webiny/api-file-manager-s3";
import logsPlugins from "@webiny/handler-logs";
import securityPlugins from "./security";

const documentClient = new DocumentClient({
    convertEmptyValues: true,
    region: process.env.AWS_REGION
});

const debug = process.env.DEBUG === "true";

export const handler = createHandler({
    plugins: [
        dynamoDbPlugins(),
        logsPlugins(),
        dbPlugins({
            table: process.env.DB_TABLE,
            driver: new DynamoDbDriver({ documentClient })
        }),
        securityPlugins({ documentClient }),
        i18nPlugins(),
        i18nDynamoDbStorageOperations(),
        i18nContentPlugins(),
        fileManagerPlugins(),
        fileManagerDynamoDbStorageOperation(),
        fileManagerS3(),
        createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient
            })
        }),
        createPageBuilderGraphQL(),
        pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({ documentClient })
        }),
        exportProcessPlugins({
            handlers: {
                process: String(process.env.AWS_LAMBDA_FUNCTION_NAME),
                combine: String(process.env.EXPORT_COMBINE_HANDLER)
            }
        })
    ],
    http: { debug }
});
