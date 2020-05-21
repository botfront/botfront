import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import {
    Message, Popup, Button, Icon,
} from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import IntentLabel from '../common/IntentLabel';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { useActivity } from '../activity/hooks';
import {
    upsertActivity as upsertActivityMutation,
    deleteActivity as deleteActivityMutation,
} from '../activity/mutations';
import { can } from '../../../../lib/scopes';

import DataTable from '../../common/DataTable';
import { clearTypenameField } from '../../../../lib/client.safe.utils';

import PrefixDropdown from '../../common/PrefixDropdown';
import IconButton from '../../common/IconButton';

function OutOfScope(props) {
    const [sortType, setSortType] = useState('Newest');
    const getSortFunction = () => {
        switch (sortType) {
        case 'Newest':
            return { sortKey: 'createdAt', sortDesc: true };
        case 'Oldest':
            return { sortKey: 'createdAt', sortDesc: false };
        default:
            throw new Error('No such sort type');
        }
    };

    const {
        model: { _id: modelId },
        projectId,
    } = props;

    const {
        data, hasNextPage, loading, loadMore, refetch, loadAll,
    } = useActivity({ modelId, ooS: true, ...getSortFunction() });

    // always refetch on first page load; change this to subscription
    useEffect(() => { if (refetch) refetch(); }, [refetch, modelId]);

    const [upsertActivity] = useMutation(upsertActivityMutation);
    const [deleteActivity] = useMutation(deleteActivityMutation);

    const handleAddToTraining = async (utterances) => {
        await Meteor.call('nlu.insertExamples', modelId, utterances);
        await deleteActivity({ variables: { modelId, ids: utterances.map(u => u._id) } });
        refetch();
    };

    const handleUpdate = async (newData, rest) => {
        // rest argument is to supress warnings caused by incomplete schema on optimistic response
        upsertActivity({
            variables: { modelId, data: newData, isOoS: true },
            optimisticResponse: {
                __typename: 'Mutation',
                upsertActivity: newData.map(d => ({ __typename: 'Activity', ...rest, ...d })),
            },
        });
    };

    const handleDelete = async (ids) => {
        await deleteActivity({ variables: { modelId, ids, isOoS: true } });
        refetch();
    };

    const renderIntent = row => (
        <IntentLabel
            value={row.datum.intent || ''}
            enableReset
            allowAdditions
            allowEditing={can('nlu-data:w', projectId)}
            onChange={intent => handleUpdate([{ _id: row.datum._id, intent, confidence: null }], row.datum)}
        />
    );

    const renderExample = row => (
        <UserUtteranceViewer
            value={row.datum}
            onChange={({ _id, entities: ents, ...rest }) => handleUpdate([{
                _id,
                entities: ents.map(e => clearTypenameField(({ ...e, confidence: null }))),
            }], rest)}
            editable
            projectId={projectId}
            showIntent={false}
        />
    );

    const renderActions = (row) => {
        const { datum } = row;
        const size = 'mini';
        const action = !datum.intent
            ? null
            : (
                <Popup
                    size={size}
                    inverted
                    content='Add this utterance to training data'
                    trigger={(
                        <IconButton
                            basic
                            size={size}
                            onClick={() => handleAddToTraining([datum])}
                            color='black'
                            icon='plus'
                        />
                    )}
                />
            );
    
        return (
            <div key={`${datum._id}-actions`} className='side-by-side narrow right'>
                {action}
                <IconButton icon='trash' onClick={() => handleDelete([datum._id])} />
            </div>
        );
    };

    const handleExport = async () => {
        const allData = await loadAll();
        const csvData = (allData || []).map(u => (
            `"${(u.intent || '-').replace('"', '""')}","${u.text.replace('"', '""')}",`
        )).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        return saveAs(blob, 'out_of_scope.csv');
    };

    const columns = [
        {
            header: 'Intent', key: 'intent', style: { width: '200px' }, render: renderIntent,
        },
        {
            header: 'Example', key: 'text', style: { width: '100%' }, render: renderExample,
        },
        ...(can('nlu-data:w', projectId) ? [
            {
                header: 'Actions', key: 'actions', style: { width: '110px' }, render: renderActions,
            },
        ] : []),
    ];

    const render = () => (
        <>
            <div className='side-by-side'>
                <div>
                    <Button onClick={handleExport} disabled={!(data || []).length}><Icon name='download' />Export</Button>
                </div>
                <PrefixDropdown
                    selection={sortType}
                    updateSelection={option => setSortType(option.value)}
                    options={[
                        { value: 'Newest', text: 'Newest' },
                        { value: 'Oldest', text: 'Oldest' },
                    ]}
                    prefix='Sort by'
                />
            </div>
            <br />
            <div className='glow-box extra-padding'>
                <DataTable
                    columns={columns}
                    data={data}
                    hasNextPage={hasNextPage}
                    loadMore={loading ? () => {} : loadMore}
                />
            </div>
        </>
    );

    return (
        <>
            {data && data.length
                ? render()
                : <Message success icon='check' header='Congratulations!' content='You are up to date' />
            }
        </>
    );
}

OutOfScope.propTypes = {
    projectId: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
};

OutOfScope.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(OutOfScope);
