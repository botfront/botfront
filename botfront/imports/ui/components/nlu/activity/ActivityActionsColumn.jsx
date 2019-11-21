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
        getSmartTips,
        isUtteranceReinterpreting,
        onToggleValidation,
        onMarkOoS,
        onDelete,
        projectId,
    } = props;

    const renderDeleteAllButton = utterances => mainAction => (
        <Button
            className='icon'
            color='teal'
            size={mainAction ? 'small' : 'mini'}
            icon
            fluid={mainAction}
            labelPosition='left'
            onClick={() => onDelete(utterances)}
        >
            <Icon name='trash' />
            {utterances.length === 1
                ? 'Delete this utterance'
                : `Delete ${utterances.length} utterances like this`
            }
        </Button>
    );

    const renderDeleteButton = utterance => mainAction => (
        <Button
            className='icon'
            color={mainAction ? 'teal' : 'grey'}
            size={mainAction ? 'small' : 'mini'}
            icon
            fluid={mainAction}
            basic={!mainAction && true}
            labelPosition='left'
            onClick={() => onDelete([utterance])}
            key={`${utterance._id}-delete`}
        >
            <Icon name='trash' /> {mainAction ? 'Delete this utterance' : 'Delete this one only'}
        </Button>
    );

    const renderValidateButton = u => mainAction => (
        <Button
            color='orange'
            size={mainAction ? 'small' : 'mini'}
            basic
            fluid={mainAction}
            content='Validate anyway'
            onClick={() => onToggleValidation(u)}
            key={`${u._id}-validate`}
        />
    );

    const size = 'mini';
    const deleteable = data.filter(u => getSmartTips(u).code === 'aboveTh');
    const { code, tip, message } = getSmartTips(datum);
    let action;
    if (code === 'outdated') {
        action = <Button size={size} disabled basic icon='redo' loading={isUtteranceReinterpreting(datum)} />;
    } else if (!!datum.validated) {
        action = <Button size={size} onClick={() => onToggleValidation(datum)} color='green' icon='check' data-cy='valid-utterance-button' />;
    } else if (code === 'aboveTh') {
        action = (
            <SmartTip
                tip={tip}
                message={message}
                mainAction={renderDeleteAllButton(deleteable)}
                otherActions={[
                    renderValidateButton(datum),
                    ...(deleteable.length > 1 ? [renderDeleteButton(datum)] : []),
                ]}
                button={(
                    <Button size={size} icon='trash' color='teal' basic />
                )}
            />
        );
    } else if (code === 'entitiesInTD') {
        action = (
            <SmartTip
                tip={tip}
                message={message}
                mainAction={renderDeleteButton(datum)}
                otherActions={[renderValidateButton(datum)]}
                button={<Button size={size} icon='info' color='yellow' />}
            />
        );
    } else if (!datum.intent) {
        action = (
            <Popup
                size={size}
                inverted
                content='Mark this utterance OoS'
                trigger={(
                    <Button
                        basic
                        size={size}
                        onClick={() => onMarkOoS(datum)}
                        color='black'
                        icon='sign-out'
                    />
                )}
            />
        );
    } else {
        action = (
            <Popup
                size={size}
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
                    trigger={<Icon data-cy='conversation-viewer' className='action-icon viewOnHover' name='comments' onClick={() => getConv()} />}
                >
        
                    {!loading && convData && (<ConversationDialogueViewer tracker={convData.conversation.tracker} messageIdInView={datum.message_id} />)}
                </Popup>
            ) : <Icon />}
            {action}
            {!['aboveTh'].includes(code) && !isUtteranceReinterpreting(datum) && <Icon name='trash' className='action-icon viewOnHover' onClick={() => onDelete([datum])} />}
        </div>
    );
}

ActivityActionsColumn.propTypes = {
    datum: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    getSmartTips: PropTypes.func.isRequired,
    isUtteranceReinterpreting: PropTypes.func.isRequired,
    onMarkOoS: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ActivityActionsColumn.defaultProps = {
};
