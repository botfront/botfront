import { useQuery, useMutation } from '@apollo/react-hooks';
import {
    GET_INTENT_STATISTICS,
    GET_EXAMPLES,
    LIST_INTENTS_AND_ENTITIES,
    INSERT_EXAMPLES,
    DELETE_EXAMPLES,
    UPDATE_EXAMPLES,
    SWITCH_CANONICAL,
} from './graphql.js';


export function useExamples(variables) {
    const {
        data, loading, error, fetchMore, refetch,
    } = useQuery(GET_EXAMPLES, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.examples) return { loading, data: [] };
    const loadMore = () => {
        fetchMore({
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
    };

    return {
        data: data.examples.examples,
        hasNextPage: data.examples.pageInfo.hasNextPage,
        loading,
        error,
        loadMore,
        refetch,
    };
}

export function useIntentAndEntityList(variables) {
    const {
        data, loading, error, refetch,
    } = useQuery(LIST_INTENTS_AND_ENTITIES, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.listIntentsAndEntities) return { loading };
    const { intents, entities } = data.listIntentsAndEntities;

    return {
        intents,
        entities,
        loading,
        error,
        refetch,
    };
}

export const useDeleteExamples = variables => useMutation(
    DELETE_EXAMPLES,
    {
        update: (cache, { data: { deleteExamples: deleted } }) => {
            const result = cache.readQuery({ query: GET_EXAMPLES, variables });
            const { examples: { examples } } = result;
            cache.writeQuery({
                query: GET_EXAMPLES,
                variables,
                data: {
                    ...result,
                    examples: {
                        ...result.examples,
                        examples: examples.filter(a => !deleted.includes(a._id)),
                    },
                },
            });
        },
    },
);


export const useSwitchCannonical = variables => useMutation(
    SWITCH_CANONICAL,
    {
        update: (cache, { data: { switchCanonical: updatedExamples } }) => {
            const updatedIds = updatedExamples.map(example => example._id);
            const result = cache.readQuery({ query: GET_EXAMPLES, variables });
            const { examples: { examples } } = result;
            const modifiedExamples = examples.map((example) => {
                const indexOfUpdated = updatedIds.indexOf(example._id);
                if (indexOfUpdated !== -1) {
                    return updatedExamples[indexOfUpdated];
                }
                return example;
            });
            cache.writeQuery({
                query: GET_EXAMPLES,
                variables,
                data: {
                    ...result,
                    examples: {
                        ...result.examples,
                        examples: modifiedExamples,
                    },
                },
            });
        },
    },
);
