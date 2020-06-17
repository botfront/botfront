import {
    Modal, Dropdown, TextArea,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { throttle } from 'lodash';
import ValidatedSequenceSelector from '../common/ValidatedSequenceSelector';
import { AnalyticsContext } from './AnalyticsContext';

function SettingsPortal(props) {
    const {
        onClose, open, text, values, onChange,
    } = props;

    const [newValues, setNewValues] = useState(
        Array.isArray(values)
            ? values.map(v => ({ key: v, text: v, value: v }))
            : values,
    );
   
    const { sequenceOptions } = useContext(AnalyticsContext);
    const onChangeThrottled = throttle(onChange, 500);

    const handleAddItem = (e, { value }) => setNewValues([...newValues, { key: value, text: value, value }]);
    const handleModifyText = (e, { value }) => { setNewValues(value); onChangeThrottled(value); };

    function renderModalContent() {
        if (Array.isArray(values) && text === 'Selected Sequence') {
            return (
                <ValidatedSequenceSelector
                    data-cy='settings-portal-sequence-selector'
                    options={sequenceOptions}
                    sequence={values}
                    onChange={value => onChange(value)}
                />
            );
        } if (Array.isArray(values)) {
            return (
                <Dropdown
                    data-cy='settings-portal-dropdown'
                    placeholder={text}
                    options={newValues}
                    search
                    selection
                    fluid
                    multiple
                    allowAdditions
                    value={values}
                    onAddItem={handleAddItem}
                    onChange={(e, { value }) => onChange(value)}
                />
            );
        }
        return (
            <TextArea
                data-cy='settings-portal-textarea'
                value={newValues}
                style={{ width: '100%' }}
                onChange={handleModifyText}
                rows={7}
                autoheight='true'
            />
        );
    }
    return (
        <Modal
            onClose={onClose}
            open={open}
            size='tiny'
        >
            <Modal.Header>{text}</Modal.Header>
            {renderModalContent()}
            <Modal.Content>
                
            </Modal.Content>
        </Modal>
    );
}

SettingsPortal.propTypes = {
    text: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    values: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    onChange: PropTypes.func.isRequired,
};

SettingsPortal.defaultProps = {
};

export default SettingsPortal;
