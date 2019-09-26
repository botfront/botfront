import React from 'react';
import { Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ToolTipPopup = ({ trigger, toolTipText, header }) => {
    return (
        <Popup
            className='tool-tip-popup'
            trigger={trigger}
            header={header}
            content={<p>{toolTipText}</p>}
        />
    );
};

ToolTipPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    toolTipText: PropTypes.string.isRequired,
    header: PropTypes.string,
};

ToolTipPopup.defaultProps = {
    header: '',
};

export default ToolTipPopup;