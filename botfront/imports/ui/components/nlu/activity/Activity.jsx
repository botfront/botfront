import React, {
    useState, useEffect, useMemo, useRef, useContext,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { debounce } from 'lodash';
import {
    Message, Button, Icon, Confirm,
} from 'semantic-ui-react';
import IntentLabel from '../common/IntentLabel';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { useActivity, useDeleteActivity, useUpsertActivity } from './hooks';

import { populateActivity } from './ActivityInsertions';
import DataTable from '../../common/DataTable';
import ActivityActionsColumn from './ActivityActionsColumn';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
import { useEventListener } from '../../utils/hooks';
import { useInsertExamples } from '../models/hooks';
import { ProjectContext } from '../../../layouts/context';

import PrefixDropdown from '../../common/PrefixDropdown';
import ActivityCommandBar from './ActivityCommandBar';

function Activity(props) {
    const [sortType, setSortType] = useState('Newest');
    const getSortFunction = () => {
        switch (sortType) {
        case 'Newest':
            return { sortKey: 'createdAt', sortDesc: true };
        case 'Oldest':
            return { sortKey: 'createdAt', sortDesc: false };
        case 'Validated first':
            return { sortKey: 'validated', sortDesc: true };
        case 'Validated last':
            return { sortKey: 'validated', sortDesc: false };
        case '% ascending':
            return { sortKey: 'confidence', sortDesc: false };
        case '% decending':
            return { sortKey: 'confidence', sortDesc: true };
        default:
            throw new Error('No such sort type');
        }
    };

    const { linkRender } = props;
    const {
        language,
        project,
        project: { training: { endTime } = {}, _id: projectId },
        instance,
    } = useContext(ProjectContext);

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useActivity({
        projectId,
        language,
        ...getSortFunction(),
    });
    const [insertExamples] = useInsertExamples({ projectId, language });
    const [selection, setSelection] = useState([]);
    let reinterpreting = [];
    const setReinterpreting = (v) => {
        reinterpreting = v;
    };
    const [confirm, setConfirm] = useState(null);
    const singleSelectedIntentLabelRef = useRef();
    const activityCommandBarRef = useRef();
    const tableRef = useRef();

    // always refetch on first page load and sortType change
    useEffect(() => {
        if (refetch) refetch();
    }, [refetch, projectId, language, sortType]);

    const [upsertActivity] = useUpsertActivity();
    const [deleteActivity] = useDeleteActivity({
        projectId,
        language,
        ...getSortFunction(),
    });

    const isUtteranceOutdated = ({ updatedAt }) => moment(updatedAt).isBefore(moment(endTime));
    const isUtteranceReinterpreting = ({ _id }) => reinterpreting.includes(_id);

    const validated = data.filter(a => a.validated);

    const getFallbackUtterance = (ids) => {
        const bounds = [ids[0], ids[ids.length - 1]].map(id1 => data.findIndex(d => d._id === id1));
        return data[bounds[1] + 1]
            ? data[bounds[1] + 1]
            : data[Math.max(0, bounds[0] - 1)];
    };

    const mutationCallback = (fallbackUtterance, mutationName) => ({
        data: { [mutationName]: res = [] } = {},
    }) => {
        const filtered = selection.filter(s => !res.map(({ _id }) => _id).includes(s));
        return setSelection(
            // remove deleted from selection
            filtered.length ? filtered : [fallbackUtterance._id],
        );
    };

    const handleAddToTraining = async (utterances) => {
        const fallbackUtterance = getFallbackUtterance(utterances.map(u => u._id));
        const examples = clearTypenameField(
            utterances.map(({ text, intent, entities }) => ({ text, intent, entities })),
        );
        insertExamples({ variables: { examples } });
        const result = await deleteActivity({
            variables: { projectId, language, ids: utterances.map(u => u._id) },
        });
        mutationCallback(fallbackUtterance, 'deleteActivity')(result);
    };

    const handleUpdate = async (newData) => {
        const dataUpdated = clearTypenameField(
            data
                .filter(d1 => newData.map(d2 => d2._id).includes(d1._id))
                .map(d1 => ({ ...d1, ...newData.find(d2 => d2._id === d1._id) })),
        );
        return upsertActivity({
            variables: { projectId, language, data: dataUpdated },
            optimisticResponse: {
                __typename: 'Mutation',
                upsertActivity: dataUpdated.map(d => ({
                    __typename: 'Activity',
                    ...d,
                })),
            },
        });
    };

    const handleDelete = (utterances) => {
        const ids = utterances.map(u => u._id);
        const fallbackUtterance = getFallbackUtterance(ids);
        const message = `Delete ${utterances.length} incoming utterances?`;
        const action = () => deleteActivity({
            variables: { projectId, language, ids },
            optimisticResponse: {
                __typename: 'Mutation',
                deleteActivity: ids.map(_id => ({ __typename: 'Activity', _id })),
            },
        }).then(mutationCallback(fallbackUtterance, 'deleteActivity'));
        return utterances.length > 1 ? setConfirm({ message, action }) : action();
    };

    const handleSetValidated = (utterances, val = true) => {
        const message = `Mark ${utterances.length} incoming utterances as ${
            val ? 'validated' : 'invalidated'
        } ?`;
        const action = () => handleUpdate(utterances.map(({ _id }) => ({ _id, validated: val })));
        return utterances.length > 1 ? setConfirm({ message, action }) : action();
    };

    const handleSetIntent = (utterances, intent) => {
        const message = intent
            ? `Set intent of ${utterances.length} incoming utterances to ${intent}?`
            : `Reset intent of ${utterances.length} incoming utterances?`;
        const action = () => handleUpdate(
            utterances.map(({ _id }) => ({
                _id,
                intent,
                confidence: null,
                ...(!intent ? { validated: false } : {}),
            })),
        );
        return utterances.length > 1 ? setConfirm({ message, action }) : action();
    };

    const handleReinterpret = async (utterances) => {
        setReinterpreting(
            Array.from(new Set([...reinterpreting, ...utterances.map(u => u._id)])),
        );
        const reset = () => setReinterpreting(
            reinterpreting.filter(
                uid => !utterances.map(u => u._id).includes(uid),
            ),
        );
        try {
            populateActivity(
                instance,
                utterances.map(u => ({ text: u.text, lang: language })),
                projectId,
                language,
                reset,
            );
        } catch (e) {
            reset();
        }
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
        const visibleData = Array(end - start + 1)
            .fill()
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
        ) { return null; }
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
                {...(selection.length === 1 && datum._id === selection[0]
                    ? { ref: singleSelectedIntentLabelRef }
                    : {})}
                disabled={isUtteranceOutdated(datum)}
                value={datum.intent ? datum.intent : ''}
                allowEditing={!isUtteranceOutdated(datum)}
                allowAdditions
                onChange={intent => handleSetIntent([{ _id: datum._id }], intent)}
                enableReset
                onClose={() => tableRef.current.tableRef().current.focus()}
            />
        );
    };

    const renderExample = (row) => {
        const { datum } = row;
        return (
            <UserUtteranceViewer
                value={datum}
                onChange={({ _id, entities }) => handleUpdate([{ _id, entities }])}
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
            handleSetValidated={handleSetValidated}
            onDelete={handleDelete}
        />
    );

    const columns = [
        { key: '_id', selectionKey: true, hidden: true },
        {
            key: 'confidence',
            style: { width: '51px', minWidth: '51px' },
            render: renderConfidence,
        },
        {
            key: 'intent',
            style: { width: '180px', minWidth: '180px', overflow: 'hidden' },
            render: renderIntent,
        },
        {
            key: 'text',
            style: { width: '100%' },
            render: renderExample,
        },
        {
            key: 'actions',
            style: { width: '110px' },
            render: renderActions,
        },
    ];

    const handleOpenIntentSetterDialogue = () => {
        if (!selection.length) return null;
        if (selection.length === 1) { return singleSelectedIntentLabelRef.current.openPopup(); }
        return activityCommandBarRef.current.openIntentPopup();
    };

    const selectionWithFullData = useMemo(
        () => data.filter(({ _id }) => selection.includes(_id)),
        [selection, data],
    );

    useEventListener('keydown', (e) => {
        const {
            key, shiftKey, metaKey, ctrlKey, altKey,
        } = e;
        if (shiftKey || metaKey || ctrlKey || altKey) return;
        if (!!confirm) {
            if (key.toLowerCase() === 'n') setConfirm(null);
            if (key.toLowerCase() === 'y' || key === 'Enter') {
                confirm.action();
                setConfirm(null);
            }
            return;
        }
        if (e.target !== tableRef.current.tableRef().current) return;
        if (key === 'Escape') setSelection([]);
        if (key.toLowerCase() === 'd') handleDelete(selectionWithFullData);
        if (key.toLowerCase() === 'v') {
            if (selectionWithFullData.some(d => !d.intent)) return;
            handleSetValidated(
                selectionWithFullData,
                selectionWithFullData.some(d => !d.validated),
            );
        }
        if (key.toLowerCase() === 'i') {
            e.preventDefault();
            handleOpenIntentSetterDialogue(e);
        }
    });

    const renderTopBar = () => (
        <div className='side-by-side' style={{ marginBottom: '10px' }}>
            {!!confirm && (
                <Confirm
                    open
                    className='with-shortcuts'
                    cancelButton='No'
                    confirmButton='Yes'
                    content={confirm.message}
                    onCancel={() => {
                        setConfirm(null);
                        tableRef.current.tableRef().current.focus();
                    }}
                    onConfirm={() => {
                        confirm.action();
                        setConfirm(null);
                        tableRef.current.tableRef().current.focus();
                    }}
                />
            )}
            <Button.Group>
                <Button
                    className='white'
                    basic
                    color='green'
                    icon
                    labelPosition='left'
                    data-cy='run-evaluation'
                    onClick={() => setConfirm({
                        message:
                                'This will evaluate the model using the validated examples as a validation set and overwrite your current evaluation results.',
                        action: linkRender,
                    })
                    }
                    disabled={!validated.length}
                >
                    <Icon name='lab' />
                    Run evaluation
                </Button>
                <Button
                    color='green'
                    icon
                    labelPosition='right'
                    data-cy='add-to-training-data'
                    onClick={() => setConfirm({
                        message:
                                'The validated utterances will be added to the training data.',
                        action: () => handleAddToTraining(validated),
                    })
                    }
                    disabled={!validated.length}
                >
                    <Icon name='add square' />
                    Add to training data
                </Button>
            </Button.Group>
            <PrefixDropdown
                selection={sortType}
                updateSelection={option => setSortType(option.value)}
                options={[
                    { value: 'Newest', text: 'Newest' },
                    { value: 'Oldest', text: 'Oldest' },
                    { value: 'Validated first', text: 'Validated first' },
                    { value: 'Validated last', text: 'Validated last' },
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
            {data && data.length ? (
                <>
                    <DataTable
                        ref={tableRef}
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
                    {selection.length > 1 && (
                        <ActivityCommandBar
                            ref={activityCommandBarRef}
                            selection={selectionWithFullData}
                            onSetValidated={handleSetValidated}
                            onDelete={handleDelete}
                            onSetIntent={handleSetIntent}
                            onCloseIntentPopup={() => tableRef.current.tableRef().current.focus()
                            }
                        />
                    )}
                </>
            ) : (
                <Message
                    success
                    icon='check'
                    header='No activity'
                    data-cy='no-activity'
                    content='No activity was found for the given criteria.'
                />
            )}
        </>
    );
}

Activity.propTypes = {
    linkRender: PropTypes.func.isRequired,
};

Activity.defaultProps = {};

export default Activity;
