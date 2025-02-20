import { GraphQLHandlerParams, useGraphQLHandler } from "./useGraphQLHandler";

const fields = `
    id
    entryId
    createdOn
    savedOn
    createdBy {
        id
        displayName
        type
    }
    ownedBy {
        id
        displayName
        type
    }
    title
    body
    categories {
        id
        entryId
        modelId
        title
    }
    category {
        id
        entryId
        modelId
        title
    }
`;

const errorFields = `
    error {
        code
        message
        data
    }
`;

const getArticleQuery = /* GraphQL */ `
    query GetArticle($where: ArticleGetWhereInput!) {
        getArticle(where: $where) {
            data {
                ${fields}
            }
            ${errorFields}
        }
    }
`;

const listArticlesQuery = /* GraphQL */ `
    query ListArticles(
        $where: ArticleListWhereInput
        $sort: [ArticleListSorter]
        $limit: Int
        $after: String
    ) {
        listArticles(where: $where, sort: $sort, limit: $limit, after: $after) {
            data {
                ${fields}
            }
            meta {
                cursor
                hasMoreItems
                totalCount
            }
            ${errorFields}
        }
    }
`;

const addPopulate = (fields: string) => {
    return fields
        .replace("categories {", "categories(populate: false) {")
        .replace("category {", "category(populate: false) {");
};
const listArticlesWithoutReferencesQuery = /* GraphQL */ `
    query ListArticles(
        $where: ArticleListWhereInput
        $sort: [ArticleListSorter!]
        $limit: Int
        $after: String
    ) {
        listArticles(where: $where, sort: $sort, limit: $limit, after: $after) {
            data {
                ${addPopulate(fields)}
            }
            meta {
                cursor
                hasMoreItems
                totalCount
            }
            ${errorFields}
        }
    }
`;

export const useArticleReadHandler = (params: GraphQLHandlerParams) => {
    const contentHandler = useGraphQLHandler(params);

    return {
        ...contentHandler,
        async getArticle(variables: Record<string, any>, headers: Record<string, any> = {}) {
            return await contentHandler.invoke({
                body: { query: getArticleQuery, variables },
                headers
            });
        },
        async listArticles(variables = {}, headers: Record<string, any> = {}) {
            return await contentHandler.invoke({
                body: { query: listArticlesQuery, variables },
                headers
            });
        },
        async listArticlesWithoutReferences(variables = {}, headers: Record<string, any> = {}) {
            return await contentHandler.invoke({
                body: { query: listArticlesWithoutReferencesQuery, variables },
                headers
            });
        }
    };
};
