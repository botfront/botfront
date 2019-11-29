import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import {
    Message, Segment, Popup, Button, Icon,
} from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import IntentViewer from './IntentViewer';
import NLUExampleText from '../../example_editor/NLUExampleText';
import { useActivity } from '../activity/hooks';
import {
    upsertActivity as upsertActivityMutation,
    deleteActivity as deleteActivityMutation,
} from '../activity/mutations';

import DataTable from '../../common/DataTable';

import PrefixDropdown from '../../common/PrefixDropdown';
import FloatingIconButton from '../common/FloatingIconButton';

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
        entities,
        intents,
        projectId,
    } = props;

    const {
        data, hasNextPage, loading, loadMore, refetch,
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

    const handleUpdate = async (d) => {
        upsertActivity({
            variables: { modelId, data: d },
            optimisticResponse: {
                __typename: 'Mutation',
                upsertActivity: {
                    __typename: 'Activity', ...d[0],
                },
            },
        });
    };

    const handleDelete = async (ids) => {
        await deleteActivity({ variables: { modelId, ids } });
        refetch();
    };

    const renderIntent = row => (
        <IntentViewer
            intents={intents.map(i => ({ value: i, text: i }))}
            example={row.datum}
            intent={row.datum.intent || ''}
            projectId={projectId}
            enableReset
            onSave={({ _id, intent }) => handleUpdate([{ _id, intent, confidence: null }])}
        />
    );

    const renderExample = row => (
        <NLUExampleText
            example={row.datum}
            entities={entities}
            showLabels
            onSave={u => handleUpdate([{
                _id: u._id,
                entities: u.entities.map((e) => { delete e.__typename; e.confidence = null; return e; }),
            }])}
            editable
            projectId={projectId}
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
                        <Button
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
            <div key={`${datum._id}-actions`}>
                {action}
                <FloatingIconButton icon='trash' onClick={() => handleDelete([datum._id])} />
            </div>
        );
    };

    const handleExport = () => {
        const csvData = (data || []).map(u => (
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
        {
            header: 'Actions', key: 'actions', style: { width: '110px' }, render: renderActions,
        },
    ];

    const render = () => (
        <>
            <Segment.Group className='new-utterances-topbar' horizontal>
                <Segment className='new-utterances-topbar-section' tertiary compact floated='left'>
                    <Button onClick={handleExport} disabled={!(data || []).length}><Icon name='download' />Export</Button>
                </Segment>
                <Segment className='new-utterances-topbar-section' tertiary compact floated='right'>
                    <PrefixDropdown
                        selection={sortType}
                        updateSelection={option => setSortType(option.value)}
                        options={[
                            { value: 'Newest', text: 'Newest' },
                            { value: 'Oldest', text: 'Oldest' },
                        ]}
                        prefix='Sort by'
                    />
                </Segment>
            </Segment.Group>
            
            <br />
            <DataTable
                columns={columns}
                data={data}
                hasNextPage={hasNextPage}
                loadMore={loading ? () => {} : loadMore}
            />
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
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
};

OutOfScope.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(OutOfScope);
