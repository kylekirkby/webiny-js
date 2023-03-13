const DATA_FIELD = /* GraphQL */ `
    {
        id
        title
        slug
        type
        parentId
    }
`;

const FOLDERS_RECORDS_DATA_FIELD = /* GraphQL */ `
    {
        __typename
        ... on Folder {
            id
            title
            slug
            type
            parentId
        }
        ... on SearchRecord {
            id
            type
            title
            content
            location {
                folderId
            }
            data
        }
    }
`;

const ERROR_FIELD = /* GraphQL */ `
    {
        code
        data
        message
    }
`;

const LIST_META_FIELD = /* GraphQL */ `
    {
        cursor
        totalCount
        hasMoreItems
    }
`;

export const CREATE_FOLDER = /* GraphQL */ `
    mutation CreateFolder($data: FolderCreateInput!) {
        aco {
            createFolder(data: $data) {
                data ${DATA_FIELD}
                error ${ERROR_FIELD}
            }
        }
    }
`;

export const UPDATE_FOLDER = /* GraphQL */ `
    mutation UpdateFolder($id: ID!, $data: FolderUpdateInput!) {
        aco {
            updateFolder(id: $id, data: $data) {
                data ${DATA_FIELD}
                error ${ERROR_FIELD}
            }
        }
    }
`;

export const DELETE_FOLDER = /* GraphQL */ `
    mutation DeleteFolder($id: ID!) {
        aco {
            deleteFolder(id: $id) {
                data
                error ${ERROR_FIELD}
            }
        }
    }
`;

export const LIST_FOLDERS = /* GraphQL */ `
    query ListFolders($where: FoldersListWhereInput!) {
        aco {
            listFolders(where: $where) {
                data ${DATA_FIELD}
                error ${ERROR_FIELD}
            }
        }
    }
`;

export const LIST_FOLDERS_RECORDS = /* GraphQL */ `
    query ListFoldersSearchRecords($where: FoldersListWhereInput!) {
        aco {
            listFoldersSearchRecords(where: $where) {
                data ${FOLDERS_RECORDS_DATA_FIELD}
                meta ${LIST_META_FIELD}
                error ${ERROR_FIELD}
            }
        }
    }
`;

export const GET_FOLDER = /* GraphQL */ `
    query GetFolder($id: ID!) {
        aco {
            getFolder(id: $id ) {
                data ${DATA_FIELD}
                error ${ERROR_FIELD}
            }
        }
    }
`;
