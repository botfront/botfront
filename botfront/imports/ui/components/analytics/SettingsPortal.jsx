import {
    Modal, Dropdown, TextArea, Input,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { throttle } from 'lodash';
import ValidatedSequenceSelector from '../common/ValidatedSequenceSelector';
import { AnalyticsContext } from './AnalyticsContext';
import IntentAndActionSelector from '../common/IntentAndActionSelector';

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
        if (text === 'Filter intents and actions') {
            return (
                <>
                    <IntentAndActionSelector
                        data-cy='settings-portal-sequence-selector'
                        options={sequenceOptions}
                        sequence={values.selection}
                        operatorValue={values.operator}
                        operatorChange={value => onChange({ ...values, operator: value })}
                        onChange={value => onChange({ ...values, selection: value || [] })}
                        allowedOperators={['and', 'or']}
                    />
                </>
            );
        } if (Array.isArray(values) && text === 'Selected sequence') {
            return (
                <ValidatedSequenceSelector
                    data-cy='settings-portal-sequence-selector'
                    options={sequenceOptions}
                    sequence={values}
                    onChange={value => onChange(value)}
                />
            );
        } if (text === 'Display limit' || text === 'Minimum number of utterances') {
            return (
                <Input
                    data-cy='settings-portal-input'
                    className='analytics-settings-number-input'
                    defaultValue={values}
                    type='number'
                    onChange={(e, { value }) => {
                        if (!value || value === '') {
                            onChange(null);
                            return;
                        }
                        onChange(value);
                    }}
                    clearable
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
            className='settings-portal-modal'
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
    values: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.number, PropTypes.object]).isRequired,
    onChange: PropTypes.func.isRequired,
};

SettingsPortal.defaultProps = {
};

export default SettingsPortal;
