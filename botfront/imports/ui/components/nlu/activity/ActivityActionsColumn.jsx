import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        onToggleValidation,
        onDelete,
    } = props;

    const size = 'small';
    let action;
    if (!!datum.validated) {
        action = (
            <div>
                <IconButton
                    size={size}
                    onClick={() => onToggleValidation(datum)}
                    color='green'
                    icon='check'
                    data-cy='valid-utterance-button'
                />
            </div>
        );
    } else {
        action = (
            <Popup
                size='mini'
                inverted
                content='Mark this utterance valid'
                trigger={(
                    <div>
                        <IconButton
                            basic
                            size={size}
                            disabled={!datum.intent}
                            onClick={() => onToggleValidation(datum)}
                            color='green'
                            icon='check'
                            data-cy='invalid-utterance-button'
                        />
                    </div>
                )}
            />
        );
    }

    return (
        <div key={`${datum._id}-actions`} className='side-by-side narrow right'>
            {action}
            <IconButton
                onClick={() => onDelete([datum])}
                color='grey'
                icon='trash'
                data-cy='trash icon-trash'
            />
        </div>
    );
}

ActivityActionsColumn.propTypes = {
    datum: PropTypes.object.isRequired,
    onToggleValidation: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {};
