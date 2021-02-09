import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import IntentLabel from '../common/IntentLabel';

const ActivityCommandBar = React.forwardRef((props, ref) => {
    const {
        selection, onSetValidated, onSetIntent, onDelete, onCloseIntentPopup, isUtteranceOutdated, onMarkOoS,
    } = props;
    const someValidated = selection.some(d => !!d.validated);
    const someOutdated = selection.some(d => isUtteranceOutdated(d));
    const someNotValidated = selection.some(d => !d.validated);
    const someLackingIntent = selection.some(d => !d.intent);
    const someHavingIntent = selection.some(d => d.intent);
    const intentLabelRef = useRef();

    useImperativeHandle(ref, () => ({
        openIntentPopup: () => intentLabelRef.current.openPopup(),
    }));
    return (
        <div className='activity-command-bar' data-cy='activity-command-bar'>
            <span>{selection.length} selected</span>
            <div className='side-by-side narrow right'>
                <span className='shortcut'>O</span>
                <Popup
                    size='mini'
                    inverted
                    content='Mark out of scope'
                    disabled={someHavingIntent}
                    trigger={(
                        <div>
                            <IconButton
                                basic
                                size='small'
                                color='black'
                                icon='sign-out'
                                disabled={someHavingIntent}
                                data-cy='mark-out-of-scope'
                                onClick={() => onMarkOoS(selection)}
                            />
                        </div>
                    )}
                />
                <span className='shortcut'>V</span>
                <Popup
                    size='mini'
                    inverted
                    content={someNotValidated ? 'Mark valid' : 'Mark invalid'}
                    disabled={someLackingIntent || someOutdated}
                    trigger={(
                        <div>
                            <IconButton
                                size='small'
                                basic={someNotValidated}
                                color='green'
                                icon={(someValidated && someNotValidated) ? 'minus' : 'check'}
                                disabled={someLackingIntent || someOutdated}
                                data-cy={someNotValidated ? 'validate-utterance' : 'invalidate-utterance'}
                                onClick={() => onSetValidated(selection, someNotValidated)}
                            />
                        </div>
                    )}
                />
                <span className='shortcut'>I</span>
                <IntentLabel
                    ref={intentLabelRef}
                    detachedModal
                    allowAdditions
                    allowEditing={!someOutdated}
                    onChange={intent => onSetIntent(selection, intent)}
                    onClose={onCloseIntentPopup}
                    enableReset
                />
                <Popup
                    size='mini'
                    inverted
                    content='Change intent'
                    disabled={someOutdated}
                    trigger={(
                        <div>
                            <IconButton
                                basic
                                size='small'
                                onClick={() => intentLabelRef.current.openPopup()}
                                disabled={someOutdated}
                                color='purple'
                                icon='tag'
                                data-cy='edit-intent'
                            />
                        </div>
                    )}
                />
                <span className='shortcut'>D</span>
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
    isUtteranceOutdated: PropTypes.func.isRequired,
    selection: PropTypes.array,
    onSetValidated: PropTypes.func.isRequired,
    onMarkOoS: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSetIntent: PropTypes.func.isRequired,
    onCloseIntentPopup: PropTypes.func.isRequired,
};

ActivityCommandBar.defaultProps = {
    selection: [],
};

export default ActivityCommandBar;
