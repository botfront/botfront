import React from 'react';
import { Popup, List } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ToolTipPopup = ({ trigger, toolTipText, header }) => (
    <Popup
        className='tool-tip-popup'
        trigger={trigger}
        header={header}
        content={(
            <List bulleted={toolTipText && toolTipText.length > 1}>
                {toolTipText.map(textElem => (
                    <List.Item key={textElem}>{textElem}</List.Item>
                ))}
            </List>
        )}
    />
);

ToolTipPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    toolTipText: PropTypes.array.isRequired,
    header: PropTypes.string,
};

ToolTipPopup.defaultProps = {
    header: '',
};

export default ToolTipPopup;
