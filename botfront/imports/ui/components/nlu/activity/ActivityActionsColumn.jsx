import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        isUtteranceOutdated,
        isUtteranceReinterpreting,
        onToggleValidation,
        onDelete,
    } = props;

    const size = 'small';
    let action;
    if (isUtteranceOutdated(datum)) {
        action = (
            <IconButton
                size={size}
                disabled
                basic
                icon='redo'
                loading={isUtteranceReinterpreting(datum)}
            />
        );
    } else if (!!datum.validated) {
        action = (
            <IconButton
                size={size}
                onClick={() => onToggleValidation(datum)}
                color='green'
                icon='check'
                data-cy='valid-utterance-button'
            />
        );
    } else {
        action = (
            <Popup
                size='mini'
                inverted
                content='Mark this utterance valid'
                trigger={(
                    <IconButton
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
        <div key={`${datum._id}-actions`} className='side-by-side narrow right'>
            {action}
            {!isUtteranceReinterpreting(datum) && (
                <IconButton
                    onClick={() => onDelete([datum])}
                    color='grey'
                    icon='trash'
                    data-cy='trash icon-trash'
                />
            )}
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

ActivityActionsColumn.defaultProps = {};
