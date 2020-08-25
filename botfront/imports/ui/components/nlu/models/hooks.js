import { useQuery, useMutation } from '@apollo/react-hooks';
import {
    GET_INTENT_STATISTICS,
    GET_EXAMPLES,
    LIST_ENTITIES,
    LIST_INTENTS,
    INSERT_EXAMPLES,
    DELETE_EXAMPLES,
    UPDATE_EXAMPLES,
} from './graphql.js';


export function useExamples(variables) {
    const {
        data, loading, error, fetchMore, refetch,
    } = useQuery(GET_EXAMPLES, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.examples) return { loading, data: [] };
    const loadMore = () => fetchMore({
        query: GET_EXAMPLES,
        notifyOnNetworkStatusChange: true,
        variables: {
            ...variables,
            cursor: data.examples.pageInfo.endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
            const { examples, pageInfo } = fetchMoreResult.examples;

            return examples.length
                ? {
                    examples: {
                        // eslint-disable-next-line no-underscore-dangle
                        __typename: previousResult.examples.__typename,
                        examples: [...previousResult.examples.examples, ...examples],
                        pageInfo,
                    },
                }
                : previousResult;
        },
    });

    return {
        data: data.examples.examples,
        hasNextPage: data.examples.pageInfo.hasNextPage,
        loading,
        error,
        loadMore,
        refetch,
    };
}

export function useIntentsList(variables) {
    const {
        data, loading, error, refetch,
    } = useQuery(LIST_INTENTS, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.listIntents) return { loading, data: [] };

    return {
        data: data.listIntents,
        loading,
        error,
        refetch,
    };
}


export function useEntitiesList(variables) {
    const {
        data, loading, error, refetch,
    } = useQuery(LIST_ENTITIES, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.listIntents) return { loading, data: [] };

    return {
        data: data.listEntities,
        loading,
        error,
        refetch,
    };
}

export const useDeleteExamples = variables => useMutation(
    DELETE_EXAMPLES,
    {
        update: (cache) => {
            console.log('variables', variables);
            const result = cache.readQuery({ query: GET_EXAMPLES, variables });
            console.log(result);
            const { examples: { examples } } = result;
            cache.writeQuery({
                query: GET_EXAMPLES,
                variables,
                data: {
                    ...result,
                    examples: {
                        ...result.examples,
                        examples: examples.filter(a => !variables.ids.includes(a._id)),
                    },
                },
            });
        },
    },
);
