import React, { useContext, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Label } from 'semantic-ui-react';
import { ProjectContext } from '../../layouts/context';
import DataTable from '../common/DataTable';
import IconButton from '../common/IconButton';
import { tooltipWrapper } from './Utils';

const projectGitHistoryQuery = gql`
    query (
        $projectId: String!
        $cursor: String
        $pageSize: Int
    ) {
        projectGitHistory(
            projectId: $projectId
            cursor: $cursor
            pageSize: $pageSize
        ) {
            commits {
                sha
                msg
                time
            },
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`;

function useGitHistory(variables) {
    const {
        data, loading, error, fetchMore, refetch,
    } = useQuery(projectGitHistoryQuery, {
        notifyOnNetworkStatusChange: true, variables,
    });

    if (!data || !data.projectGitHistory) return { loading, data: [] };

    const loadMore = () => fetchMore({
        query: projectGitHistoryQuery,
        notifyOnNetworkStatusChange: true,
        variables: {
            ...variables,
            cursor: data.projectGitHistory.pageInfo.endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
            const { commits, pageInfo } = fetchMoreResult.projectGitHistory;

            return commits.length
                ? {
                    projectGitHistory: {
                        __typename: previousResult.projectGitHistory.__typename,
                        commits: [...previousResult.projectGitHistory.activity, ...commits],
                        pageInfo,
                    },
                }
                : previousResult;
        },
    });

    return {
        data: data.projectGitHistory.commits,
        hasNextPage: data.projectGitHistory.pageInfo.hasNextPage,
        loading,
        error,
        loadMore,
        refetch,
    };
}

export default function RevertTable() {
    const { project: { _id: projectId } } = useContext(ProjectContext);
    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useGitHistory({ projectId });
    useEffect(() => { refetch?.(); }, [projectId]);
    const columns = [
        {
            key: 'sha',
            selectionKey: true,
            style: { width: '110px', minWidth: '110px', wordBreak: 'break-all' },
            render: ({ datum }) => tooltipWrapper(<Label>{datum?.sha?.substring(0, 8)}</Label>, datum?.sha),
        },
        {
            key: 'time',
            style: { width: '180px', minWidth: '180px', overflow: 'hidden' },
            render: ({ datum }) => new Date(datum?.time * 1000).toLocaleString(),
        },
        {
            key: 'msg',
            style: { width: '100%' },
        },
        {
            key: 'action',
            style: { width: '40px' },
            render: ({ datum }) => <IconButton icon='checkmark' onClick={() => alert(datum?.sha)} />,
        },
    ];
    
    return (
        <DataTable
            columns={columns}
            data={data}
            hasNextPage={hasNextPage}
            loadMore={loading ? () => {} : loadMore}
            height={400}
        />
    );
}
