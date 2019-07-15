import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import './style.less';

const ActionPopupContent = (props) => {
    const {
        onChange, trigger,
    } = props;

    const [isOpen, setIsOpen] = useState();
    const [actionName, setActionName] = useState();

    return (
        <Popup
            trigger={trigger}
            wide
            on='click'
            open={isOpen}
            onOpen={() => { setIsOpen(true); }}
            onClose={() => { setIsOpen(false); }}
        >
            <p className='all-caps-header'>Enter name</p>
            <div>
                <form onSubmit={(e) => { e.preventDefault(); setActionName(null); setIsOpen(false); onChange(actionName); }}>
                    <input value={actionName} onChange={e => setActionName(e.target.value)} />
                </form>
            </div>
        </Popup>
    );
};

ActionPopupContent.propTypes = {
    onChange: PropTypes.func,
    trigger: PropTypes.element.isRequired,
};

ActionPopupContent.defaultProps = {
    onChange: () => {},
};

export default ActionPopupContent;
