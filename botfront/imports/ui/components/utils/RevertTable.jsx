import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import {
    Dimmer, Loader, Button, Icon,
} from 'semantic-ui-react';
import { wrapMeteorCallback } from './Errors';
import { ProjectContext } from '../../layouts/context';
import DataTable from '../common/DataTable';

const projectGitHistoryQuery = gql`
    query($projectId: String!, $cursor: String, $pageSize: Int) {
        projectGitHistory(projectId: $projectId, cursor: $cursor, pageSize: $pageSize) {
            commits {
                url
                author
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

const RevertTable = ({ useGitWorkingState }) => {
    const {
        project: { _id: projectId },
    } = useContext(ProjectContext);

    const [working, setWorking] = useGitWorkingState();

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useGitHistory({
        projectId,
    });

    useEffect(() => {
        refetch?.();
    }, [projectId]);

    const revertToCommit = (sha) => {
        setWorking(true);
        Meteor.call(
            'revertToCommit',
            projectId,
            sha,
            wrapMeteorCallback((err, { status: { code, msg } = {} } = {}) => {
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

    const renderCommit = (row) => {
        const { datum } = row;
        const sha = (
            <a href={datum?.url} target='_blank' rel='noopener noreferrer'>
                ({datum?.sha?.substring(0, 8)})
            </a>
        );
        const time = new Date(datum?.time * 1000).toLocaleString();
        const msg = datum?.msg;
        return (
            <div>
                <b>{msg}</b> {sha}<br />
                by {datum?.author}, {time}
            </div>
        );
    };

    const columns = [
        { key: 'sha', selectionKey: true, hidden: true },
        {
            key: 'commit',
            style: { width: '100%' },
            render: renderCommit,
        },
        {
            key: 'action',
            style: { width: '115x' },
            render: row => (
                <Button
                    className='white'
                    size='mini'
                    basic
                    color='blue'
                    icon
                    labelPosition='left'
                    data-cy='revert-to-this-commit'
                    onClick={() => revertToCommit(row?.datum.sha)}
                >
                    <Icon name='undo' />
                    Revert
                </Button>
            ),
        },
    ];

    if (working) {
        return (
            <div style={{ height: 400 }}>
                <Dimmer active inverted>
                    <Loader size='massive' />
                </Dimmer>
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
            rowClassName='taller-line'
        />
    );
};

RevertTable.propTypes = {
    useGitWorkingState: PropTypes.func.isRequired,
};

export default RevertTable;
