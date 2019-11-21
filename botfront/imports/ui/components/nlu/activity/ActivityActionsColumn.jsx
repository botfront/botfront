import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Popup, Icon,
} from 'semantic-ui-react';

import { useLazyQuery } from '@apollo/react-hooks';
import SmartTip from './SmartTip';
import { GET_CONVERSATION } from '../../conversations/queries';
import ConversationDialogueViewer from '../../conversations/ConversationDialogueViewer';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        data,
        isUtteranceOutdated,
        isUtteranceReinterpreting,
        onToggleValidation,
        onReinterpret,
        onDelete,
        projectId,
    } = props;

    const renderReinterpretAllButton = utterances => mainAction => (
        <Button
            className='icon'
            color='grey'
            size={mainAction ? 'small' : 'mini'}
            icon
            fluid={mainAction}
            labelPosition='left'
            onClick={() => onReinterpret(utterances)}
        >
            <Icon name='redo' />
            {utterances.length === 1
                ? 'Reinterpret this utterance'
                : `Reinterpret ${utterances.length} utterances like this`
            }
        </Button>
    );

    const renderReinterpretButton = utterance => mainAction => (
        <Button
            className='icon'
            color='grey'
            basic={!mainAction}
            size={mainAction ? 'small' : 'mini'}
            icon
            fluid={mainAction}
            labelPosition='left'
            onClick={() => onReinterpret([utterance])}
            key={`${utterance._id}-reinterpret`}
        >
            <Icon name='redo' />
            {mainAction
                ? 'Reinterpret this utterance'
                : 'Reinterpret this one only'
            }
        </Button>
    );

    const size = 'mini';
    const outdated = data.filter(isUtteranceOutdated).slice(0, 20);
    let action;
    if (isUtteranceReinterpreting(datum)) {
        action = <Button size={size} disabled basic icon='redo' loading />;
    } else if (isUtteranceOutdated(datum)) {
        action = (
            <SmartTip
                tip='Utterance outdated'
                message='Model has been trained since this utterance was logged. It needs to be reinterpreted.'
                mainAction={renderReinterpretAllButton(outdated)}
                otherActions={[...(outdated.length > 1 ? [renderReinterpretButton(datum)] : [])]}
                button={(
                    <Button size={size} basic icon='redo' data-cy='re-interpret-button' />
                )}
            />
        );
    } else if (!!datum.validated) {
        action = <Button size={size} onClick={() => onToggleValidation(datum)} color='green' icon='check' data-cy='valid-utterance-button' />;
    } else {
        action = (
            <Popup
                size='mini'
                inverted
                content='Mark this utterance valid'
                trigger={(
                    <Button
                        basic
                        size={size}
                        disabled={!datum.intent}
                        onClick={() => onToggleValidation(datum)}
                        color='green'
                        icon='check'
                        data-cy='invalid-utterance-button'
                    />
                )}
            />
        );
    }

    const [getConv, { loading, data: convData }] = useLazyQuery(GET_CONVERSATION, {
        variables: { projectId, conversationId: datum.conversation_id },
    });
    return (
        <div key={`${datum._id}-actions`}>
            { datum.conversation_id ? (
                <Popup
                    className='dialogue-popup'
                    on='click'
                    trigger={<Icon className='action-icon' name='comments viewOnHover' onClick={() => getConv()} />}
                >
        
                    {!loading && convData && (<ConversationDialogueViewer tracker={convData.conversation.tracker} messageIdInView={datum.message_id} />)}
                </Popup>
            ) : <Icon />}
            {action}
            {!isUtteranceReinterpreting(datum) && <Icon name='trash' className='action-icon viewOnHover' onClick={() => onDelete([datum])} />}
        </div>
    );
}

ActivityActionsColumn.propTypes = {
    data: PropTypes.array.isRequired,
    datum: PropTypes.object.isRequired,
    isUtteranceOutdated: PropTypes.func.isRequired,
    isUtteranceReinterpreting: PropTypes.func.isRequired,
    onReinterpret: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ActivityActionsColumn.defaultProps = {
};
