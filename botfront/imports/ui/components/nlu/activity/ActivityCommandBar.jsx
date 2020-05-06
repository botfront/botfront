import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import IntentLabel from '../common/IntentLabel';

const ActivityCommandBar = React.forwardRef((props, ref) => {
    const {
        selection, onSetValidated, onSetIntent, onDelete, onCloseIntentPopup,
    } = props;
    const someValidated = selection.some(d => !!d.validated);
    const someNotValidated = selection.some(d => !d.validated);
    const someLackingIntent = selection.some(d => !d.intent);
    const intentLabelRef = useRef();

    useImperativeHandle(ref, () => ({
        openIntentPopup: () => intentLabelRef.current.openPopup(),
    }));

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
                                size='small'
                                basic={someNotValidated}
                                color='green'
                                icon={(someValidated && someNotValidated) ? 'minus' : 'check'}
                                disabled={someLackingIntent}
                                data-cy='valid-utterance-button'
                                onClick={() => onSetValidated(selection, someNotValidated)}
                            />
                        </div>
                    )}
                />
                <IntentLabel
                    ref={intentLabelRef}
                    detachedModal
                    allowAdditions
                    allowEditing
                    onChange={intent => onSetIntent(selection, intent)}
                    onClose={onCloseIntentPopup}
                />
                <Popup
                    size='mini'
                    inverted
                    content='Change intent'
                    trigger={(
                        <div>
                            <IconButton
                                size='small'
                                onClick={() => intentLabelRef.current.openPopup()}
                                color='purple'
                                icon='edit'
                                data-cy='edit-intent'
                            />
                        </div>
                    )}
                />
                <IconButton
                    size='small'
                    onClick={() => onDelete(selection)}
                    color='grey'
                    icon='trash'
                    data-cy='trash icon-trash'
                />
            </div>
        </div>
    );
});

ActivityCommandBar.propTypes = {
    selection: PropTypes.array,
    onSetValidated: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSetIntent: PropTypes.func.isRequired,
    onCloseIntentPopup: PropTypes.func.isRequired,
};

ActivityCommandBar.defaultProps = {
    selection: [],
};

export default ActivityCommandBar;
