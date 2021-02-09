import React from 'react';
import PropTypes from 'prop-types';
import { Button, Confirm } from 'semantic-ui-react';

const buttonStyle = {
    transitionProperty: 'background-color',
    transitionDuration: '0.35s',
    fontWeight: 300,
};

class SaveButton extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
        };
    }

    setModalOpen = (open) => {
        this.setState({ confirmOpen: open });
    }

    handleConfirm = (e) => {
        const {
            saved, onSave,
        } = this.props;
        if (!saved) {
            onSave(e);
        }
        this.setModalOpen(false);
    }

    handleClick = (e) => {
        const {
            confirmText, onSave, saved,
        } = this.props;
        if (!saved && (confirmText === '')) {
            onSave(e);
        } else {
            e.preventDefault();
            this.setModalOpen(true);
        }
    }


    render() {
        const {
            saving, saved, disabled, saveText, onSave, confirmText,
        } = this.props;
        const {
            confirmOpen,
        } = this.state;
        if (confirmText) {
            return (
                <>
                    <Button
                        disabled={(disabled || saving) && !saved}
                        onClick={this.handleClick}
                        primary={!saved}
                        positive={saved}
                        data-cy='save-button'
                        style={buttonStyle}
                        icon={saved ? 'check' : null}
                        content={saved ? 'Saved' : saveText}
                    />

                    <Confirm
                        open={confirmOpen}
                        onCancel={() => { this.setModalOpen(false); }}
                        onConfirm={(e) => { this.handleConfirm(e); }}
                        content={confirmText}
                    />

                </>
            );
        }
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
    confirmText: PropTypes.string,
};

SaveButton.defaultProps = {
    saving: false,
    saved: false,
    disabled: false,
    onSave: () => { },
    saveText: 'Save',
    confirmText: '',
};

export default SaveButton;
