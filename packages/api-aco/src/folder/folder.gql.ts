import { ErrorResponse, ListResponse } from "@webiny/handler-graphql/responses";
import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/plugins/GraphQLSchemaPlugin";

import { resolve } from "~/utils/resolve";

import { AcoContext } from "~/types";

export const folderSchema = new GraphQLSchemaPlugin<AcoContext>({
    typeDefs: /* GraphQL */ `
        type Folder {
            id: ID!
            title: String!
            slug: String!
            type: String!
            parentId: ID
            savedOn: DateTime
            createdOn: DateTime
            createdBy: AcoUser
        }

        input FolderCreateInput {
            title: String!
            slug: String!
            type: String!
            parentId: ID
        }

        input FolderUpdateInput {
            title: String
            slug: String
            parentId: ID
        }

        input FoldersListWhereInput {
            type: String!
            parentId: String
        }

        type FolderResponse {
            data: Folder
            error: AcoError
        }

        type FoldersListResponse {
            data: [Folder]
            error: AcoError
        }

        union FolderSearchRecord = Folder | SearchRecord

        type FolderSearchRecordListResponse {
            data: [FolderSearchRecord]
            error: AcoError
            meta: AcoMeta
        }

        extend type AcoQuery {
            getFolder(id: ID!): FolderResponse
            listFolders(
                where: FoldersListWhereInput!
                limit: Int
                after: String
                sort: AcoSort
            ): FoldersListResponse
            listFoldersSearchRecords(
                where: FoldersListWhereInput!
                limit: Int
                after: String
                sort: AcoSort
            ): FolderSearchRecordListResponse
        }

        extend type AcoMutation {
            createFolder(data: FolderCreateInput!): FolderResponse
            updateFolder(id: ID!, data: FolderUpdateInput!): FolderResponse
            deleteFolder(id: ID!): AcoBooleanResponse
        }
    `,
    resolvers: {
        FolderSearchRecord: {
            __resolveType(obj) {
                // Only SearchRecord has a name field
                if (obj.content) {
                    return "SearchRecord";
                }
                // Only Folder has a title field
                if (obj.slug) {
                    return "Folder";
                }
                return null; // GraphQLError is thrown
            }
        },
        AcoQuery: {
            getFolder: async (_, { id }, context) => {
                return resolve(() => context.aco.folder.get(id));
            },
            listFolders: async (_, args: any, context) => {
                try {
                    const [entries, meta] = await context.aco.folder.list(args);
                    return new ListResponse(entries, meta);
                } catch (e) {
                    return new ErrorResponse(e);
                }
            },
            listFoldersSearchRecords: async (_, args: any, context) => {
                try {
                    const [entries, meta] = await context.aco.folder.listUnion(args);
                    return new ListResponse(entries, meta);
                } catch (e) {
                    return new ErrorResponse(e);
                }
            }
        },
        AcoMutation: {
            createFolder: async (_, { data }, context) => {
                return resolve(() => context.aco.folder.create(data));
            },
            updateFolder: async (_, { id, data }, context) => {
                return resolve(() => context.aco.folder.update(id, data));
            },
            deleteFolder: async (_, { id }, context) => {
                return resolve(() => context.aco.folder.delete(id));
            }
        }
    }
});
