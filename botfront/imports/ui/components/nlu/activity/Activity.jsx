import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { debounce } from 'lodash';
import { Message } from 'semantic-ui-react';
import IntentLabel from '../common/IntentLabel';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { useActivity, useDeleteActivity, useUpsertActivity } from './hooks';

import { populateActivity } from './ActivityInsertions';
import DataTable from '../../common/DataTable';
import ActivityActions from './ActivityActions';
import ActivityActionsColumn from './ActivityActionsColumn';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';

import PrefixDropdown from '../../common/PrefixDropdown';

function Activity(props) {
    const [sortType, setSortType] = useState('Newest');
    const getSortFunction = () => {
        switch (sortType) {
        case 'Newest':
            return { sortKey: 'createdAt', sortDesc: true };
        case 'Oldest':
            return { sortKey: 'createdAt', sortDesc: false };
        case '% ascending':
            return { sortKey: 'confidence', sortDesc: false };
        case '% decending':
            return { sortKey: 'confidence', sortDesc: true };
        default:
            throw new Error('No such sort type');
        }
    };

    const {
        model: { _id: modelId, language: lang },
        instance,
        project,
        project: { training: { endTime } = {} },
        projectId,
        linkRender,
    } = props;

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useActivity({ modelId, ...getSortFunction() });
    const [selection, setSelection] = useState([]);
    let reinterpreting = [];
    const setReinterpreting = (v) => { reinterpreting = v; };

    // always refetch on first page load and sortType change
    useEffect(() => { if (refetch) refetch(); }, [refetch, modelId, sortType]);

    const [upsertActivity] = useUpsertActivity();
    const [deleteActivity] = useDeleteActivity({ modelId, ...getSortFunction() });

    const isUtteranceOutdated = ({ updatedAt }) => moment(updatedAt).isBefore(moment(endTime));
    const isUtteranceReinterpreting = ({ _id }) => reinterpreting.includes(_id);

    const validated = data.filter(a => a.validated);

    const handleAddToTraining = async (utterances) => {
        await Meteor.call('nlu.insertExamples', modelId, utterances);
        await deleteActivity({ variables: { modelId, ids: utterances.map(u => u._id) } });
    };

    const handleUpdate = async (newData, rest) => {
        // rest argument is to supress warnings caused by incomplete schema on optimistic response
        upsertActivity({
            variables: { modelId, data: newData },
            optimisticResponse: {
                __typename: 'Mutation',
                upsertActivity: newData.map(d => ({ __typename: 'Activity', ...rest, ...d })),
            },
        });
    };

    const handleDelete = async (ids) => {
        await deleteActivity({
            variables: { modelId, ids },
            optimisticResponse: {
                __typename: 'Mutation',
                deleteActivity: ids.map(_id => ({ __typename: 'Activity', _id })),
            },
        });
    };

    const handleReinterpret = async (utterances) => {
        setReinterpreting(Array.from(new Set([...reinterpreting, ...utterances.map(u => u._id)])));
        const reset = () => setReinterpreting(reinterpreting.filter(uid => !utterances.map(u => u._id).includes(uid)));
        try {
            populateActivity(instance, utterances.map(u => ({ text: u.text, lang })), modelId, reset);
        } catch (e) { reset(); }
    };

    const doAttemptReinterpretation = (visibleData) => {
        if (isTraining(project)) return;
        if (reinterpreting.length > 49) return;
        const reinterpretable = visibleData
            .filter(isUtteranceOutdated)
            .filter(u => !isUtteranceReinterpreting(u));
        if (reinterpretable.length) handleReinterpret(reinterpretable);
    };

    const handleScroll = debounce((items) => {
        const { visibleStartIndex: start, visibleStopIndex: end } = items;
        const visibleData = Array(end - start + 1).fill()
            .map((_, i) => start + i)
            .map(i => data[i])
            .filter(d => d);
        doAttemptReinterpretation(visibleData);
    }, 500);

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
        return (
            <IntentLabel
                disabled={isUtteranceOutdated(datum)}
                value={datum.intent ? datum.intent : ''}
                allowEditing={!isUtteranceOutdated(datum)}
                allowAdditions
                onChange={intent => handleUpdate([{ _id: datum._id, intent, confidence: null }], datum)}
                enableReset
            />
        );
    };

    const renderExample = (row) => {
        const { datum } = row;
        return (
            <UserUtteranceViewer
                value={datum}
                onChange={({ _id, entities: ents, ...rest }) => handleUpdate([{
                    _id,
                    entities: ents.map(e => clearTypenameField(({ ...e, confidence: null }))),
                }], rest)}
                projectId={projectId}
                disabled={isUtteranceOutdated(datum)}
                disableEditing={isUtteranceOutdated(datum)}
                showIntent={false}
            />
        );
    };

    const renderActions = row => (
        <ActivityActionsColumn
            datum={row.datum}
            onToggleValidation={({ _id, validated: val, ...rest }) => handleUpdate([{ _id, validated: !val }], rest)}
            onDelete={utterances => handleDelete(utterances.map(u => u._id))}
        />
    );

    const columns = [
        { key: '_id', selectionKey: true, hidden: true },
        {
            key: 'confidence', style: { width: '51px', minWidth: '51px' }, render: renderConfidence,
        },
        {
            key: 'intent', style: { width: '180px', minWidth: '180px', overflow: 'hidden' }, render: renderIntent,
        },
        {
            key: 'text', style: { width: '100%' }, render: renderExample,
        },
        {
            key: 'actions', style: { width: '110px' }, render: renderActions,
        },
    ];

    const renderTopBar = () => (
        <div className='side-by-side'>
            <ActivityActions
                onEvaluate={linkRender}
                onDelete={() => handleDelete(validated.map(u => u._id))}
                onAddToTraining={() => handleAddToTraining(validated)}
                onInvalidate={() => handleUpdate(validated.map(({ _id, validated: v }) => ({ _id, validated: !v })))}
                numValidated={validated.length}
                projectId={projectId}
            />
            <PrefixDropdown
                selection={sortType}
                updateSelection={option => setSortType(option.value)}
                options={[
                    { value: 'Newest', text: 'Newest' },
                    { value: 'Oldest', text: 'Oldest' },
                    { value: '% ascending', text: '% ascending' },
                    { value: '% decending', text: '% decending' },
                ]}
                prefix='Sort by'
            />
        </div>
    );

    return (
        <>
            {renderTopBar()}
            {data && data.length
                ? (
                    <DataTable
                        columns={columns}
                        data={data}
                        hasNextPage={hasNextPage}
                        loadMore={loading ? () => {} : loadMore}
                        onScroll={handleScroll}
                        rowClassName='glow-box hoverable'
                        className='new-utterances-table'
                        selection={selection}
                        onChangeSelection={setSelection}
                    />
                )
                : <Message success icon='check' header='No activity' content='No activity was found for the given criteria.' />
            }
        </>
    );
}

Activity.propTypes = {
    projectId: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    linkRender: PropTypes.func.isRequired,
};

Activity.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Activity);
