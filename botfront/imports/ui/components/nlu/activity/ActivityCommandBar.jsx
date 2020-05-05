import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

function ActivityCommandBar(props) {
    const { selection, handleSetValidated, onDelete } = props;
    const size = 'small';
    const someValidated = selection.some(d => !!d.validated);
    const someNotValidated = selection.some(d => !d.validated);
    const someLackingIntent = selection.some(d => !d.intent);
    return (
        <div className='activity-command-bar'>
            {selection.length} selected
            <div className='side-by-side narrow right'>
                <Popup
                    size='mini'
                    inverted
                    content={someNotValidated ? 'Mark valid' : 'Mark invalid'}
                    disabled={someLackingIntent}
                    trigger={(
                        <div>
                            <IconButton
                                size={size}
                                basic={someNotValidated}
                                color='green'
                                icon={(someValidated && someNotValidated) ? 'minus' : 'check'}
                                disabled={someLackingIntent}
                                data-cy='valid-utterance-button'
                                onClick={() => handleSetValidated(selection, someNotValidated)}
                            />
                        </div>
                    )}
                />
                <IconButton
                    onClick={() => onDelete(selection)}
                    color='grey'
                    icon='trash'
                    data-cy='trash icon-trash'
                />
            </div>
        </div>
    );
}

ActivityCommandBar.propTypes = {
    selection: PropTypes.array,
    handleSetValidated: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

ActivityCommandBar.defaultProps = {
    selection: [],
};

export default ActivityCommandBar;
