import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Popup, Icon,
} from 'semantic-ui-react';

import FloatingIconButton from '../common/FloatingIconButton';
import SmartTip from './SmartTip';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        data,
        getSmartTips,
        isUtteranceReinterpreting,
        onToggleValidation,
        onMarkOoS,
        onReinterpret,
        onDelete,
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
    const outdated = data.filter(u => getSmartTips(u).code === 'outdated').slice(0, 20);
    const deleteable = data.filter(u => getSmartTips(u).code === 'aboveTh');
    const { code, tip, message } = getSmartTips(datum);
    let action;
    if (isUtteranceReinterpreting(datum)) {
        action = <Button size={size} disabled basic icon='redo' loading />;
    } else if (code === 'outdated') {
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

    return (
        <div key={`${datum._id}-actions`}>
            {action}
            {!['aboveTh'].includes(code) && !isUtteranceReinterpreting(datum) && <FloatingIconButton icon='trash' onClick={() => onDelete([datum])} />}
        </div>
    );
}

ActivityActionsColumn.propTypes = {
    data: PropTypes.array.isRequired,
    datum: PropTypes.object.isRequired,
    getSmartTips: PropTypes.func.isRequired,
    isUtteranceReinterpreting: PropTypes.func.isRequired,
    onReinterpret: PropTypes.func.isRequired,
    onMarkOoS: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {
};
