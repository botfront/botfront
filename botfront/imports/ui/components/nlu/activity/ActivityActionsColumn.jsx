import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Popup,
} from 'semantic-ui-react';

import FloatingIconButton from '../common/FloatingIconButton';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        isUtteranceOutdated,
        isUtteranceReinterpreting,
        onToggleValidation,
        onDelete,
    } = props;

    const size = 'mini';
    let action;
    if (isUtteranceOutdated(datum)) {
        action = <Button size={size} disabled basic icon='redo' loading={isUtteranceReinterpreting(datum)} />;
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
    datum: PropTypes.object.isRequired,
    isUtteranceOutdated: PropTypes.func.isRequired,
    isUtteranceReinterpreting: PropTypes.func.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {
};
