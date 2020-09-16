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

    return {
        data: data.getActivity.activity,
        hasNextPage: data.getActivity.pageInfo.hasNextPage,
        loading,
        error,
        loadMore,
        refetch,
    };
}

export const useDeleteActivity = variables => useMutation(
    deleteActivityMutation,
    {
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

export const useUpsertActivity = () => useMutation(upsertActivityMutation);
