import {
    Modal, Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

function SettingsPortal(props) {
    const {
        onClose, open, text, values, onChange,
    } = props;

    const [options, setOptions] = useState(
        values.map(v => ({ key: v, text: v, value: v })),
    );

    const handleAddItem = (e, { value }) => setOptions([...options, { key: value, text: value, value }]);

    return (
        <Modal
            onClose={onClose}
            open={open}
            size='small'
        >
            <Modal.Header>{text}</Modal.Header>
            <Modal.Content>
                <Dropdown
                    placeholder={text}
                    options={options}
                    search
                    selection
                    fluid
                    multiple
                    allowAdditions
                    value={values}
                    onAddItem={handleAddItem}
                    onChange={(e, { value }) => onChange(value)}
                />
            </Modal.Content>
        </Modal>
    );
}

SettingsPortal.propTypes = {
    text: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

SettingsPortal.defaultProps = {
};

export default SettingsPortal;
