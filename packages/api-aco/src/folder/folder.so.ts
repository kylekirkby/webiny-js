import { CmsEntry } from "@webiny/api-headless-cms/types";
import WebinyError from "@webiny/error";

import { FOLDER_MODEL_ID } from "./folder.model";
import { baseFields, CreateAcoStorageOperationsParams } from "~/createAcoStorageOperations";
import { SEARCH_RECORD_MODEL_ID } from "~/record/record.model";
import { createListSort } from "~/utils/createListSort";
import { createOperationsWrapper } from "~/utils/createOperationsWrapper";
import { getFieldValues } from "~/utils/getFieldValues";

import { AcoFolderStorageOperations } from "./folder.types";

interface AcoCheckExistingFolderParams {
    params: {
        type: string;
        slug: string;
        parentId?: string | null;
    };
    id?: string;
}

export const createFolderOperations = (
    params: CreateAcoStorageOperationsParams
): AcoFolderStorageOperations => {
    const { cms, security } = params;

    const { withModel } = createOperationsWrapper({
        ...params,
        modelName: FOLDER_MODEL_ID
    });

    const getRecordModel = async () => {
        security.disableAuthorization();
        const model = await cms.getModel(SEARCH_RECORD_MODEL_ID);
        security.enableAuthorization();
        if (!model) {
            throw new WebinyError(
                `Could not find "${SEARCH_RECORD_MODEL_ID}" model.`,
                "MODEL_NOT_FOUND_ERROR"
            );
        }
        return model;
    };

    const getFolderModel = async () => {
        security.disableAuthorization();
        const model = await cms.getModel(FOLDER_MODEL_ID);
        security.enableAuthorization();
        if (!model) {
            throw new WebinyError(
                `Could not find "${FOLDER_MODEL_ID}" model.`,
                "MODEL_NOT_FOUND_ERROR"
            );
        }
        return model;
    };

    const getFolder: AcoFolderStorageOperations["getFolder"] = ({ id, slug, type, parentId }) => {
        return withModel(async model => {
            let entry;

            if (id) {
                entry = await cms.getEntryById(model, id);
            } else if (slug && type) {
                entry = await cms.getEntry(model, {
                    where: { slug, type, parentId, latest: true }
                });
            }

            if (!entry) {
                throw new WebinyError("Could not load folder.", "GET_FOLDER_ERROR", {
                    id,
                    slug,
                    type,
                    parentId
                });
            }

            return getFieldValues(entry, baseFields);
        });
    };

    const checkExistingFolder = ({ id, params }: AcoCheckExistingFolderParams) => {
        return withModel(async model => {
            const { type, slug, parentId } = params;

            const [existings] = await cms.listLatestEntries(model, {
                where: {
                    type,
                    slug,
                    parentId,
                    id_not: id
                },
                limit: 1
            });

            if (existings.length > 0) {
                throw new WebinyError(
                    `Folder with slug "${slug}" already exists at this level.`,
                    "FOLDER_ALREADY_EXISTS",
                    {
                        id,
                        params
                    }
                );
            }

            return;
        });
    };

    return {
        getFolder,
        listFolders(params) {
            return withModel(async model => {
                const { sort, where } = params;

                const [entries, meta] = await cms.listLatestEntries(model, {
                    ...params,
                    sort: createListSort(sort),
                    where: {
                        ...(where || {})
                    }
                });

                return [entries.map(entry => getFieldValues(entry, baseFields)), meta];
            });
        },
        async listUnion(params) {
            const folderModel = await getFolderModel();
            const searchModel = await getRecordModel();
            security.disableAuthorization();

            const { sort, where, after } = params;
            const { type, parentId } = where;

            let folders = [] as CmsEntry[];
            if (!after) {
                const [foldersResponse] = await cms.listLatestEntries(folderModel, {
                    ...params,
                    sort: createListSort(sort),
                    where: {
                        type,
                        parentId
                    },
                    limit: -1
                });

                folders = foldersResponse;
            }

            const [searchRecords, meta] = await cms.listLatestEntries(searchModel, {
                ...params,
                sort: createListSort(sort),
                where: {
                    type,
                    location: {
                        folderId: parentId || "ROOT"
                    }
                }
            });

            security.enableAuthorization();
            return [
                [
                    ...folders.map(folder => getFieldValues(folder, baseFields)),
                    ...searchRecords.map(record => getFieldValues(record, baseFields, true))
                ],
                meta
            ];
        },
        createFolder({ data }) {
            return withModel(async model => {
                await checkExistingFolder({
                    params: {
                        type: data.type,
                        slug: data.slug,
                        parentId: data.parentId
                    }
                });

                const entry = await cms.createEntry(model, {
                    ...data,
                    parentId: data.parentId || null
                });

                return getFieldValues(entry, baseFields);
            });
        },
        updateFolder({ id, data }) {
            return withModel(async model => {
                const { slug, parentId } = data;

                const original = await getFolder({ id });

                await checkExistingFolder({
                    id,
                    params: {
                        type: original.type,
                        slug: slug || original.slug,
                        parentId: parentId !== undefined ? parentId : original.parentId // parentId can be `null`
                    }
                });

                const input = {
                    ...original,
                    ...data
                };

                const entry = await cms.updateEntry(model, id, input);
                return getFieldValues(entry, baseFields);
            });
        },
        deleteFolder({ id }) {
            return withModel(async model => {
                await cms.deleteEntry(model, id);
                return true;
            });
        }
    };
};
