import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

const buttonStyle = {
    transitionProperty: 'background-color',
    transitionDuration: '0.35s',
    fontWeight: 300,
};

class SaveButton extends React.PureComponent {
    render() {
        const {
            saving, saved, disabled, onSave, saveText,
        } = this.props;

        return (
            <Button
                disabled={(disabled || saving) && !saved}
                onClick={saved ? () => {} : onSave}
                primary={!saved}
                positive={saved}
                data-cy='save-button'
                style={buttonStyle}
                icon={saved ? 'check' : null}
                content={saved ? 'Saved' : saveText}
            />
        );
    }
}

SaveButton.propTypes = {
    saving: PropTypes.bool,
    saved: PropTypes.bool,
    disabled: PropTypes.bool,
    onSave: PropTypes.func,
    saveText: PropTypes.string,
};

SaveButton.defaultProps = {
    saving: false,
    saved: false,
    disabled: false,
    onSave: () => {},
    saveText: 'Save',
};

export default SaveButton;
