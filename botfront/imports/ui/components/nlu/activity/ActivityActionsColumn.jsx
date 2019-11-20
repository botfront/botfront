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
        isUtteranceOutdated,
        isUtteranceReinterpreting,
        onToggleValidation,
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

    return (
        <div key={`${datum._id}-actions`}>
            {action}
            {!isUtteranceReinterpreting(datum) && <FloatingIconButton icon='trash' onClick={() => onDelete([datum])} />}
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
};

ActivityActionsColumn.defaultProps = {
};
