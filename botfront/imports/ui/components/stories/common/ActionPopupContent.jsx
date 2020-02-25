import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup, Input } from 'semantic-ui-react';
import Linker from '../../Linker';

const ActionPopupContent = (props) => {
    const { onSelect, trigger, trackOpenMenu } = props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [actionName, setActionName] = useState('action_');
    const triggerRef = useRef();
    
    const handleToggle = (e) => {
        if (e) e.stopPropagation();
        setMenuOpen(!menuOpen);
        if (!menuOpen) trackOpenMenu(() => setMenuOpen(false));
    };

    return (
        <>
            <Linker onClick={handleToggle} ref={triggerRef}>{trigger}</Linker>
            {!!menuOpen && (
                <Popup
                    tabIndex={0}
                    wide
                    on='click'
                    open
                    context={triggerRef.current}
                    onClose={handleToggle}
                >
                    <p className='all-caps-header'>Enter an action name</p>
                    <div className='action-name-form'>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setActionName('action_');
                                setMenuOpen(false);
                                if (actionName && actionName !== 'action_') onSelect(actionName);
                            }}
                        >
                            <div className='action-name-prefix'>action_</div>
                            <Input value={actionName.replace(/^action_/, '')} onChange={e => setActionName(`action_${e.target.value.trim()}`)} autoFocus />
                        </form>
                    </div>
                </Popup>
            )}
        </>
    );
};

ActionPopupContent.propTypes = {
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    trackOpenMenu: PropTypes.func,
};

ActionPopupContent.defaultProps = {
    onSelect: () => {},
    trackOpenMenu: () => {},
};

export default ActionPopupContent;
