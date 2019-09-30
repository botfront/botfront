import React from 'react';
import { Popup, List } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ToolTipPopup = ({ trigger, toolTipText, header }) => {
    const renderToolTipList = () => toolTipText.map(textElem => <List.Item>{textElem}</List.Item>);
    return (
        <Popup
            className='tool-tip-popup'
            trigger={trigger}
            header={header}
            content={(
                <List bulleted={toolTipText && toolTipText.length > 1}>
                    {renderToolTipList()}
                </List>
            )}
        />
    );
};

ToolTipPopup.propTypes = {
    trigger: PropTypes.element.isRequired,
    toolTipText: PropTypes.array.isRequired,
    header: PropTypes.string,
};

ToolTipPopup.defaultProps = {
    header: '',
};

export default ToolTipPopup;
