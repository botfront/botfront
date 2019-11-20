import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import moment from 'moment';
import { Message, Segment, Label } from 'semantic-ui-react';
import IntentViewer from '../models/IntentViewer';
import NLUExampleText from '../../example_editor/NLUExampleText';
import { useActivity } from './hooks';
import {
    upsertActivity as upsertActivityMutation,
    deleteActivity as deleteActivityMutation,
    addActivityToTraining as addActivityToTrainingMutation,
} from './mutations';

import { populateActivity } from './ActivityInsertions';
import DataTable from '../../common/DataTable';
import ActivityActions from './ActivityActions';
import ActivityActionsColumn from './ActivityActionsColumn';

import PrefixDropdown from '../../common/PrefixDropdown';

function Activity(props) {
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
        model: { _id: modelId, language: lang },
        instance,
        entities,
        intents,
        project: { training: { endTime } = {} },
        projectId,
        linkRender,
    } = props;

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useActivity({ modelId, ...getSortFunction() });
    const [reinterpreting, setReinterpreting] = useState([]);

    // always refetch on first page load; change this to subscription
    useEffect(() => { if (refetch) refetch(); }, [refetch, modelId]);

    const [upsertActivity] = useMutation(upsertActivityMutation);
    const [deleteActivity] = useMutation(deleteActivityMutation);
    const [addActivityToTraining] = useMutation(addActivityToTrainingMutation);

    const isUtteranceOutdated = ({ updatedAt }) => moment(updatedAt).isBefore(moment(endTime));
    const isUtteranceReinterpreting = ({ _id }) => reinterpreting.includes(_id);

    const validated = data.filter(a => a.validated);

    const handleAddToTraining = async (ids) => {
        await addActivityToTraining({ variables: { modelId, ids } });
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

    const handleReinterpret = async (utterances) => {
        setReinterpreting(Array.from(new Set([...reinterpreting, ...utterances.map(u => u._id)])));
        const reset = () => setReinterpreting(reinterpreting.filter(uid => !utterances.map(u => u._id).includes(uid)));
        try {
            populateActivity(instance, utterances.map(u => ({ text: u.text, lang })), modelId, reset);
        } catch (e) { reset(); }
    };

    const renderConfidence = (row) => {
        const { datum } = row;
        if (
            isUtteranceOutdated(datum)
            || typeof datum.intent !== 'string'
            || typeof datum.confidence !== 'number'
            || datum.confidence <= 0
        ) return null;
        return (
            <div className='confidence-text'>
                {`${Math.floor(datum.confidence * 100)}%`}
            </div>
        );
    };

    const renderIntent = (row) => {
        const { datum } = row;
        if (isUtteranceOutdated(datum)) {
            return (
                <Label color='grey' basic data-cy='intent-label'>
                    {datum.intent || '-'}
                </Label>
            );
        }
        return (
            <IntentViewer
                intents={intents.map(i => ({ value: i, text: i }))}
                example={datum}
                intent={datum.intent || ''}
                projectId={projectId}
                enableReset
                onSave={({ _id, intent }) => handleUpdate([{ _id, intent, confidence: null }])}
            />
        );
    };

    const renderExample = (row) => {
        const { datum } = row;
        return (
            <NLUExampleText
                example={datum}
                entities={entities}
                showLabels
                onSave={u => handleUpdate([{
                    _id: u._id,
                    entities: u.entities.map((e) => { delete e.__typename; e.confidence = null; return e; }),
                }])}
                editable={!isUtteranceOutdated(datum)}
                disablePopup={isUtteranceOutdated(datum)}
                projectId={projectId}
            />
        );
    };

    const renderActions = row => (
        <ActivityActionsColumn
            data={data}
            datum={row.datum}
            instance={instance}
            modelId={modelId}
            lang={lang}
            isUtteranceReinterpreting={isUtteranceReinterpreting}
            isUtteranceOutdated={isUtteranceOutdated}
            onToggleValidation={u => handleUpdate([{ _id: u._id, validated: !u.validated }])}
            onReinterpret={handleReinterpret}
            onDelete={u => handleDelete([u._id])}
        />
    );

    const columns = [
        {
            header: '%', key: 'confidence', style: { width: '40px' }, render: renderConfidence,
        },
        {
            header: 'Intent', key: 'intent', style: { width: '160px' }, render: renderIntent,
        },
        {
            header: 'Example', key: 'text', style: { width: '100%' }, render: renderExample,
        },
        {
            header: 'Actions', key: 'actions', style: { width: '160px' }, render: renderActions,
        },
    ];

    const render = () => (
        <>
            <Segment.Group className='new-utterances-topbar' horizontal>
                <Segment className='new-utterances-topbar-section' tertiary compact floated='left'>
                    <ActivityActions
                        onEvaluate={linkRender}
                        onDelete={() => handleDelete(validated.map(u => u._id))}
                        onAddToTraining={() => handleAddToTraining(validated.map(u => u._id))}
                        onInvalidate={() => handleUpdate(validated.map(({ _id, validated: v }) => ({ _id, validated: !v })))}
                        numValidated={validated.length}
                        projectId={projectId}
                    />
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

Activity.propTypes = {
    projectId: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    linkRender: PropTypes.func.isRequired,
};

Activity.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Activity);
