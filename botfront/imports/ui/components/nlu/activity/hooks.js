import { useQuery, useSubscription } from '@apollo/react-hooks';
import { activityQuery, activitySubscription } from './queries';

export function useActivity(variables) {
    const pageSize = 10;
    const {
        data, loading, error, fetchMore,
    } = useQuery(activityQuery, {
        notifyOnNetworkStatusChange: true, variables: { ...variables, pageSize },
    });

    if (!data || !data.getActivity) return { loading, data: [] };

    const loadMore = () => fetchMore({
        query: activityQuery,
        notifyOnNetworkStatusChange: true,
        variables: {
            ...variables,
            pageSize,
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
    };
}
