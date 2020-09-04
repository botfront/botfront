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

    useImperativeHandle(ref, () => ({
        openIntentPopup: () => intentLabelRef.current.openPopup(),
    }));

    return (
        <div className='activity-command-bar' data-cy='activity-command-bar'>
            <span>{selection.length} selected</span>
            <div className='side-by-side narrow right'>
                {onSetIntent !== null && onCloseIntentPopup !== null && (
                    <>
                        <span className='shortcut'>I</span>
                        <IntentLabel
                            ref={intentLabelRef}
                            detachedModal
                            allowAdditions
                            allowEditing
                            onChange={intent => onSetIntent(selection, intent)}
                            onClose={onCloseIntentPopup}
                            enableReset
                        />
                        <Popup
                            size='mini'
                            inverted
                            content='Change intent'
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
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
                {onDelete !== null && (
                <>
                    <span className='shortcut'>D</span>
                    <IconButton
                        size='small'
                        onClick={() => onDelete(selection)}
                        color='grey'
                        icon='trash'
                        data-cy='trash icon-trash'
                    />
                </>
                )}
                {onUndraft !== null && (
                    <>
                        <span className='shortcut'>U</span>
                        <Popup
                            size='mini'
                            inverted
                            content='Undraft'
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
                                        onClick={() => onUndraft(selection)}
                                        color='green'
                                        icon='check'
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
