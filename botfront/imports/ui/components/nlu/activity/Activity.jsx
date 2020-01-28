import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Message, Popup } from 'semantic-ui-react';
import { useLazyQuery } from '@apollo/react-hooks';
import IconButton from '../../common/IconButton';
import IntentLabel from '../common/IntentLabel';
import UserUtteranceViewer from '../common/UserUtteranceViewer';
import { useActivity, useDeleteActivity, useUpsertActivity } from './hooks';

import { populateActivity } from './ActivityInsertions';
import { getSmartTips } from '../../../../lib/smart_tips';
import Filters from '../models/Filters';
import { ProjectContext } from '../../../layouts/context';

import DataTable from '../../common/DataTable';
import ActivityActions from './ActivityActions';
import ActivityActionsColumn from './ActivityActionsColumn';
import { clearTypenameField } from '../../../../lib/utils';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';

import PrefixDropdown from '../../common/PrefixDropdown';
import { GET_CONVERSATION } from '../../conversations/queries';
import ConversationDialogueViewer from '../../conversations/ConversationDialogueViewer';
import CanonicalPopup from '../common/CanonicalPopup';

function Activity(props) {
    const [sortType, setSortType] = useState('Newest');
    const {
        intents,
        entities,
    } = useContext(ProjectContext);
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
        model,
        model: { _id: modelId, language: lang },
        workingEnvironment,
        instance,
        project,
        projectId,
        linkRender,
    } = props;

    const [openConvPopup, setOpenConvPopup] = useState(-1);
    const [filter, setFilter] = useState({ entities: [], intents: [], query: '' });
    let reinterpreting = [];
    const setReinterpreting = (v) => { reinterpreting = v; };

    const {
        data, hasNextPage, loading, loadMore, refetch,
    } = useActivity({
        modelId,
        env: workingEnvironment,
        filter,
        ...getSortFunction(),
    });
    
    // always refetch on first page load and sortType change
    useEffect(() => { if (refetch) refetch(); }, [refetch, modelId, workingEnvironment, sortType, filter]);

    const [upsertActivity] = useUpsertActivity({
        modelId, env: workingEnvironment, filter, ...getSortFunction(),
    });
    const [deleteActivity] = useDeleteActivity({
        modelId, env: workingEnvironment, filter, ...getSortFunction(),
    });

    const isUtteranceOutdated = u => getSmartTips(model, project, u).code === 'outdated';
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

    const handleChangeInVisibleItems = (visibleData) => {
        if (isTraining(project)) return;
        if (reinterpreting.length > 49) return;
        const reinterpretable = visibleData
            .filter(isUtteranceOutdated)
            .filter(u => !isUtteranceReinterpreting(u));
        if (reinterpretable.length) handleReinterpret(reinterpretable);
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
        return (
            <CanonicalPopup
                example={datum}
                trigger={(
                    <IntentLabel
                        disabled={isUtteranceOutdated(datum)}
                        value={datum.intent ? datum.intent : ''}
                        allowEditing={!isUtteranceOutdated(datum)}
                        allowAdditions
                        onChange={intent => handleUpdate([{ _id: datum._id, intent, confidence: null }], datum)}
                        enableReset
                    />
                )}
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
                editable={!isUtteranceOutdated(datum)}
                disablePopup={isUtteranceOutdated(datum)}
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
            data={data}
            instance={instance}
            modelId={modelId}
            lang={lang}
            projectId={projectId}
            onToggleValidation={({ _id, validated: val, ...rest }) => handleUpdate([{ _id, validated: !val }], rest)}
            getSmartTips={u => getSmartTips(model, project, u)}
            onMarkOoS={({ _id, ooS, ...rest }) => handleUpdate([{ _id, ooS: !ooS }], rest)}
            onDelete={utterances => handleDelete(utterances.map(u => u._id))}
        />
    );

    const renderConvPopup = (row) => {
        const convId = row.datum.conversation_id;
        const [getConv, { loading: convLoading, data: convData }] = useLazyQuery(GET_CONVERSATION, {
            variables: { projectId, conversationId: convId },
        });
        if (row.index === openConvPopup
            && convId
            && !convData
            && !convLoading
        ) {
            getConv();
        }
        return (
            <Popup
                id={`conversation-popup-${row.index}`}
                className={convId ? 'dialogue-popup' : ''}
                on={convId ? 'click' : 'hover'}
                open={row.index === openConvPopup}
                onClose={(e) => {
                    if (/conversation-popup/.test(e.target.id)
                        || /conversation-popup/.test((e.target.parentElement || {}).id)
                    ) {
                        /* if the click is on another conv popup trigger
                            setOpenConvPopup will be set by that trigger */
                        return;
                    }
                    setOpenConvPopup(-1);
                }}
                trigger={(
                    <IconButton
                        // basic
                        id={`conversation-popup-trigger-${row.index}`}
                        icon='comments'
                        color='grey'
                        data-cy='conversation-viewer'
                        className={`action-icon ${!convId && 'inactive'}`}
                        name='comments'
                        size='mini'
                        // closeOnScroll // disabled as it also closes when scrolling inside the popup
                        onClick={() => {
                            if (row.index !== openConvPopup) {
                                setOpenConvPopup(row.index);
                            } else {
                                setOpenConvPopup(-1);
                            }
                        }}
                    />
                )}
            >
                {!convLoading && convData && convId && (
                    <ConversationDialogueViewer
                        conversation={convData.conversation}
                        messageIdInView={row.datum.message_id}
                    />
                )}
                {!convId && 'No conversation data'}
            </Popup>
        );
    };
        
    const columns = [
        {
            key: 'confidence', style: { width: '51px', minWidth: '51px' }, render: renderConfidence,
        },
        {
            key: 'intent', style: { width: '180px', minWidth: '180px', overflow: 'hidden' }, render: renderIntent,
        },
        {
            key: 'conversation-popup', style: { width: '30px', minWidth: '30px' }, render: renderConvPopup,
        },
        {
            key: 'text', style: { width: '100%' }, render: renderExample,
        },
        {
            key: 'actions', style: { width: '150px' }, render: renderActions,
        },
    ];

    const renderTopBar = () => (
        <>
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
            <Filters
                intents={intents}
                entities={entities}
                filter={filter}
                onChange={f => setFilter(f)}
                className='side-by-side right narrow'
            />
        </>
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
                        onChangeInVisibleItems={handleChangeInVisibleItems}
                        className='new-utterances-table'
                    />
                )
                : <Message success icon='check' header='No activity' content='No activity was found for the given criteria.' />
            }
        </>
    );
}

Activity.propTypes = {
    projectId: PropTypes.string.isRequired,
    workingEnvironment: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    project: PropTypes.object.isRequired,
    linkRender: PropTypes.func.isRequired,
};

Activity.defaultProps = {
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingEnvironment: state.settings.get('workingDeploymentEnvironment'),
});

export default connect(mapStateToProps)(Activity);
