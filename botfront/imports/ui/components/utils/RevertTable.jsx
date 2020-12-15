import React, {
    useContext, useEffect, useState, useImperativeHandle,
} from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import {
    Label, Placeholder, Icon,
} from 'semantic-ui-react';
import { wrapMeteorCallback } from './Errors';
import { ProjectContext } from '../../layouts/context';
import DataTable from '../common/DataTable';
import IconButton from '../common/IconButton';
import { tooltipWrapper } from './Utils';

const projectGitHistoryQuery = gql`
    query($projectId: String!, $cursor: String, $pageSize: Int) {
        projectGitHistory(projectId: $projectId, cursor: $cursor, pageSize: $pageSize) {
            commits {
                sha
                msg
                time
                isHead
            }
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
    } = useQuery(
        projectGitHistoryQuery,
        {
            notifyOnNetworkStatusChange: true,
            variables,
        },
    );

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
                        commits: [
                            ...previousResult.projectGitHistory.commits,
                            ...commits,
                        ],
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

export default React.forwardRef((_, ref) => {
    const {
        project: { _id: projectId },
    } = useContext(ProjectContext);

    const [working, setWorking] = useState(false);

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useGitHistory({
        projectId,
    });

    useImperativeHandle(ref, () => ({
        isIdle: () => !working,
    }));

    useEffect(() => {
        refetch?.();
    }, [projectId]);

    const revertToCommit = (sha) => {
        setWorking(true);
        Meteor.call(
            'revertToCommit',
            projectId,
            sha,
            wrapMeteorCallback((err, { status: { code, msg } }) => {
                setWorking(false);
                if (err) return;
                Alert[code === 204 ? 'warning' : 'success'](msg, {
                    position: 'top-right',
                    timeout: 2 * 1000,
                });
                refetch?.();
            }),
        );
    };
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
            render: ({ datum }) => {
                if (datum.isHead) return null;
                return (
                    <IconButton
                        icon='step backward'
                        color='blue'
                        onClick={() => revertToCommit(datum.sha)}
                    />
                );
            },
        },
    ];

    if (working) {
        return (
            <div style={{ height: 400 }}>
                <Icon
                    name='code branch'
                    size='massive'
                    color='grey'
                    style={{
                        position: 'absolute', zIndex: 50, top: '30%', left: '30%',
                    }}
                />
                <Placeholder fluid>
                    {Array.from(new Array(20)).map((el, i) => <Placeholder.Line key={i} />)}
                </Placeholder>
            </div>
        );
    }
    return (
        <DataTable
            columns={columns}
            data={data}
            hasNextPage={hasNextPage}
            loadMore={loading ? () => {} : loadMore}
            height={400}
        />
    );
});
