import {
    Modal, Dropdown, TextArea, Input, Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { throttle } from 'lodash';
import ValidatedSequenceSelector from '../common/ValidatedSequenceSelector';
import { AnalyticsContext } from './AnalyticsContext';
import IntentAndActionSelector from '../common/IntentAndActionSelector';
import SequenceSelector from '../common/SequenceSelector';
import { validateEventFilters } from '../../../lib/eventFilter.utils';

const SettingsPortal = (props) => {
    const {
        text,
        value,
        onClose,
        open,
        setting,
        onChange,
    } = props;

    const { sequenceOptions, slotOptions, actionOptions } = useContext(AnalyticsContext);
    const onChangeThrottled = throttle(onChange, 500);
    const [newValue, setnewValue] = useState(
        Array.isArray(value)
            ? value.map(v => ({ key: v, text: v, value: v }))
            : value,
    );
    const [errors, setErrors] = useState([]);
    const handleAddItem = (e, { value: val }) => setnewValue([...newValue, { key: val, text: val, value: val }]);
    const handleModifyText = (e, { value: val }) => { setnewValue(val); onChangeThrottled(val); };

    const renderDefaultDropdown = () => (
        <Dropdown
            data-cy='settings-portal-dropdown'
            placeholder={text}
            options={newValue}
            search
            selection
            fluid
            multiple
            allowAdditions
            value={value}
            onAddItem={handleAddItem}
            onChange={(e, { value: val }) => onChange(val)}
        />
    );

    const renderIntentDropdown = () => (
        <SequenceSelector
            onChange={(val) => {
                onChange(val);
            }}
            sequence={value}
            enableExclusions={false}
            allowedEventTypes={['intent']}
            bordered
        />
    );
    
    const renderIntentAndActionSelector = () => (
        <>
            {errors && errors.length > 0 && <Message negative header='Errors' list={errors} />}
            <IntentAndActionSelector
                data-cy='settings-portal-sequence-selector'
                sequence={newValue.selection}
                operatorValue={value.operator}
                operatorChange={val => onChange({ ...value, operator: val })}
                onChange={(val) => {
                    const updatedValue = { ...value, selection: val || [] };
                    const validationResult = validateEventFilters(val, value.operator);
                    setnewValue(updatedValue);
                    if (validationResult.length > 0) {
                        setErrors(validationResult);
                        return;
                    }
                    setErrors([]);
                    onChange(updatedValue);
                }
                }
                allowedOperators={['and', 'or']}
                actionOptions={actionOptions}
                slotOptions={slotOptions}
            />
        </>
    );
    
    const renderSequenceSelector = () => (
        <ValidatedSequenceSelector
            data-cy='settings-portal-sequence-selector'
            options={sequenceOptions}
            sequence={value}
            onChange={val => onChange(val)}
            slotOptions={slotOptions}
            actionOptions={actionOptions}
        />
    );

    const renderNumberInput = () => (
        <Input
            data-cy='settings-portal-input'
            className='analytics-settings-number-input'
            defaultValue={value}
            type='number'
            onChange={(e, { value: val }) => {
                if (!val || val === '') {
                    onChange(null);
                    return;
                }
                onChange(val);
            }}
            clearable
        />
    );

    const renderModalContent = () => {
        switch (setting) {
        case 'includeActions':
        case 'excludeActions':
            return renderDefaultDropdown();
        case 'includeIntents':
        case 'excludeIntents':
            return renderIntentDropdown();
        case 'eventFilter':
            return renderIntentAndActionSelector();
        case 'conversationLength':
        case 'limit':
            return renderNumberInput();
        case 'selectedSequence':
            return renderSequenceSelector();
        default:
            return (
                <TextArea
                    data-cy='settings-portal-textarea'
                    value={value}
                    style={{ width: '100%' }}
                    onChange={handleModifyText}
                    rows={7}
                    autoheight='true'
                />
            );
        }
    };

    return (
        <Modal
            onClose={onClose}
            open={open}
            size='tiny'
            className='settings-portal-modal'
        >
            <Modal.Header>{text}</Modal.Header>
            <Modal.Content>
                {renderModalContent()}
            </Modal.Content>
        </Modal>
    );
};


SettingsPortal.propTypes = {
    text: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.number, PropTypes.object]),
    setting: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

SettingsPortal.defaultProps = {
    setting: null,
    value: null,
};

export default SettingsPortal;
