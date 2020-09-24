import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Input } from 'semantic-ui-react';

const ActionPopupContent = (props) => {
    const {
        onSelect, trigger, initialValue, trackOpenMenu,
    } = props;
    const [isOpen, setIsOpen] = useState();
    const [actionName, setActionName] = useState(initialValue || '');

    return (
        <Popup
            tabIndex={0}
            trigger={trigger}
            wide
            on='click'
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
                trackOpenMenu(() => setIsOpen(false));
            }}
            onClose={() => {
                setActionName(initialValue);
                setIsOpen(false);
            }}
        >
            <p className='all-caps-header'>Enter an action name</p>
            <div className='action-name-form'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActionName('');
                        setIsOpen(false);
                        if (actionName && actionName !== 'action_') onSelect(actionName);
                    }}
                >
                    <div className='action-name-prefix'>action_</div>
                    <Input
                        value={actionName.replace(/^(action_)*/, '')}
                        onChange={e => setActionName(
                            `action_${e.target.value
                                .trim()
                                .replace(/^(action_)*/, '')}`,
                        )}
                        autoFocus
                    />
                </form>
            </div>
        </Popup>
    );
};

ActionPopupContent.propTypes = {
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    initialValue: PropTypes.string,
    trackOpenMenu: PropTypes.func,
};

ActionPopupContent.defaultProps = {
    onSelect: () => {},
    initialValue: '',
    trackOpenMenu: () => {},
};

export default ActionPopupContent;
