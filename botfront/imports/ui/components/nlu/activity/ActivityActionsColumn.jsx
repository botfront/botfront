import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

export default function ActivityActionsColumn(props) {
    const {
        datum,
        outdated,
        handleSetValidated,
        onDelete,
    } = props;

    const size = 'small';
    let action;
    if (!!datum.validated) {
        action = (
            <div>
                <IconButton
                    size={size}
                    onClick={() => handleSetValidated([datum], false)}
                    color='green'
                    className='persistent'
                    icon='check'
                    data-cy='invalidate-utterance'
                />
            </div>
        );
    } else {
        action = (
            <Popup
                size='mini'
                inverted
                disabled={outdated || !datum.intent}
                content='Mark this utterance valid'
                trigger={(
                    <div>
                        <IconButton
                            basic
                            size={size}
                            disabled={outdated || !datum.intent}
                            onClick={() => handleSetValidated([datum], true)}
                            color='green'
                            icon='check'
                            className='persistent'
                            data-cy='validate-utterance'
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
                size={size}
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
    outdated: PropTypes.bool.isRequired,
    handleSetValidated: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityActionsColumn.defaultProps = {};
