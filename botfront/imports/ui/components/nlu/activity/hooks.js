import { useQuery, useMutation } from '@apollo/react-hooks';
import { activityQuery } from './queries';
import {
    upsertActivity as upsertActivityMutation,
    deleteActivity as deleteActivityMutation,
} from './mutations';

export function useActivity(variables) {
    const {
        data, loading, error, fetchMore, refetch,
    } = useQuery(activityQuery, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.getActivity) return { loading, data: [] };

    const loadMore = () => fetchMore({
        query: activityQuery,
        notifyOnNetworkStatusChange: true,
        variables: {
            ...variables,
            cursor: data.getActivity.pageInfo.endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
            const { activity, pageInfo } = fetchMoreResult.getActivity;

            return activity.length
                ? {
                    getActivity: {
                        __typename: previousResult.getActivity.__typename,
                        activity: [...previousResult.getActivity.activity, ...activity],
                        pageInfo,
                    },
                }
                : previousResult;
        },
    });


    const loadAll = async () => new Promise((resolve, reject) => {
        fetchMore({
            query: activityQuery,
            notifyOnNetworkStatusChange: true,
            variables: {
                ...variables,
                pageSize: 0,
                cursor: data.getActivity.pageInfo.endCursor,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                const { activity } = fetchMoreResult.getActivity;
                resolve([...previousResult.getActivity.activity, ...activity]);
                return previousResult; // we do not update the ui with all the example at once as it may slow down the ui
            },
        });
    });

    return {
        data: data.getActivity.activity,
        hasNextPage: data.getActivity.pageInfo.hasNextPage,
        loading,
        error,
        loadMore,
        refetch,
        loadAll,
    };
}

export const useDeleteActivity = variables => useMutation(
    deleteActivityMutation,
    {
        variables,
        update: (cache, { data: { deleteActivity: deleted } }) => {
            const result = cache.readQuery({ query: activityQuery, variables });
            const { getActivity: { activity } } = result;
            cache.writeQuery({
                query: activityQuery,
                variables,
                data: {
                    ...result,
                    getActivity: {
                        ...result.getActivity,
                        activity: activity.filter(a => !deleted.map(del => del._id).includes(a._id)),
                    },
                },
            });
        },
    },
);

export const useUpsertActivity = variables => useMutation(
    upsertActivityMutation,
    {
        variables,
        update: (cache, { data: { upsertActivity: upserted } }) => {
            const result = cache.readQuery({ query: activityQuery, variables });
            const { getActivity: { activity } } = result;
            const madeOos = upserted.filter(u => u.ooS);
            if (!variables.ooS && madeOos.length) {
                cache.writeQuery({
                    query: activityQuery,
                    variables,
                    data: {
                        ...result,
                        getActivity: {
                            ...result.getActivity,
                            activity: activity.filter(a => !madeOos.map(del => del._id).includes(a._id)),
                        },
                    },
                });
            }
        },
    },
);
