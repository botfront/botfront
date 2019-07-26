import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Input } from 'semantic-ui-react';

const ActionPopupContent = (props) => {
    const { onSelect, trigger } = props;
    const [isOpen, setIsOpen] = useState();
    const [actionName, setActionName] = useState();

    return (
        <Popup
            trigger={trigger}
            wide
            on='click'
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
            }}
            onClose={() => {
                setIsOpen(false);
            }}
        >
            <p className='all-caps-header'>Enter an action name</p>
            <div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActionName(null);
                        setIsOpen(false);
                        if (actionName && actionName !== '') onSelect(actionName);
                    }}
                >
                    <Input value={actionName} onChange={e => setActionName(e.target.value.trim())} />
                </form>
            </div>
        </Popup>
    );
};

ActionPopupContent.propTypes = {
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
};

ActionPopupContent.defaultProps = {
    onSelect: () => {},
};

export default ActionPopupContent;
