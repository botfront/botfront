import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import IntentLabel from '../common/IntentLabel';

const NluCommandBar = React.forwardRef((props, ref) => {
    const {
        selection, onSetIntent, onDelete, onCloseIntentPopup, onUndraft,
    } = props;
    
    const intentLabelRef = useRef();
    const selectionIncludesCanonical = selection.some(d => d.metadata?.canonical);
    const selectionIncludesNonDraft = selection.some(d => !d.metadata?.draft);

    useImperativeHandle(ref, () => ({
        openIntentPopup: () => intentLabelRef.current.openPopup(),
    }));

    return (
        <div className='activity-command-bar' data-cy='activity-command-bar'>
            <span>{selection.length} selected</span>
            <div className='side-by-side narrow right'>
                {onSetIntent && onCloseIntentPopup && (
                    <>
                        <span className='shortcut'>I</span>
                        <IntentLabel
                            ref={intentLabelRef}
                            detachedModal
                            allowAdditions
                            allowEditing={!selectionIncludesCanonical}
                            onChange={intent => onSetIntent(selection.map(({ _id }) => _id), intent)}
                            onClose={onCloseIntentPopup}
                            enableReset
                        />
                        <Popup
                            size='mini'
                            inverted
                            disabled={selectionIncludesCanonical}
                            content='Change intent'
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
                                        disabled={selectionIncludesCanonical}
                                        onClick={() => intentLabelRef.current.openPopup()}
                                        color='purple'
                                        icon='tag'
                                        data-cy='edit-intent'
                                    />
                                </div>
                            )}
                        />
                    </>
                )}
                {onDelete && (
                <>
                    <span className='shortcut'>D</span>
                    <IconButton
                        size='small'
                        onClick={() => onDelete(selection.map(({ _id }) => _id))}
                        color='grey'
                        icon='trash'
                        data-cy='trash icon-trash'
                    />
                </>
                )}
                {onUndraft && !selectionIncludesNonDraft && (
                    <>
                        <span className='shortcut'>S</span>
                        <Popup
                            size='mini'
                            inverted
                            content='Save'
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
                                        onClick={() => onUndraft(selection.map(({ _id }) => _id))}
                                        color='blue'
                                        icon='save'
                                        data-cy='remove-draft'
                                    />
                                </div>
                            )}
                        />
                    </>
                )}
            </div>
        </div>
    );
});

NluCommandBar.propTypes = {
    selection: PropTypes.array,
    onDelete: PropTypes.func,
    onSetIntent: PropTypes.func,
    onCloseIntentPopup: PropTypes.func,
    onUndraft: PropTypes.func,
};

NluCommandBar.defaultProps = {
    selection: [],
    onUndraft: null,
    onDelete: null,
    onSetIntent: null,
    onCloseIntentPopup: null,

};

export default NluCommandBar;
