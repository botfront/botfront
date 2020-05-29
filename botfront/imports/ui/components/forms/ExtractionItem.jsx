import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
    Dropdown, List, Divider, Input,
} from 'semantic-ui-react';

const ExtractionItem = (props) => {
    const {
        slotFilling: {
            type,
            entity,
            intent,
            not_intent: notIntent,
            value,
            intentCondition = 'include',
        },
        slotFilling,
        intents,
        entities,
        slot,
        onChange,
        index,
    } = props;

    const handleIntentConditionChange = (e, { value: selectedCondition }) => {
        if (selectedCondition === intentCondition) return;
        if (selectedCondition === 'include') onChange({ intent: notIntent || [], not_intent: null, intentCondition: 'include' });
        if (selectedCondition === 'exclude') onChange({ intent: null, not_intent: intent || [], intentCondition: 'exclude' });
    };

    const handleChangeIntent = (e, { value: intentSelection }) => {
        const update = intentCondition === 'include'
            ? { intent: intentSelection }
            : { not_intent: intentSelection };
        onChange(update);
    };

    const handleValueSourceChange = (e, { value: source }) => {
        onChange({ type: source });
    };

    const handleChangeValue = (e, { value: newValue }) => {
        onChange({ value: newValue });
    };

    const handleChangeValueFromIntent = () => {

    };

    const renderSelectEntitiy = () => (
        <Dropdown
            className='extraction-dropdown'
            selection
            placeholder='select an entity'
            options={entities}
            value={entity || undefined}
            onChange={handleChangeValue}
        />
    );

    const rederCategoricalDropdown = () => {
        const { categories } = slot;
        return (
            <Dropdown
                className='extraction-dropdown'
                selection
                placeholder='select a category'
                options={categories.map(category => ({ value: category, text: category }))}
                value={value}
                onChange={handleChangeValue}
            />
        );
    };

    const renderBoolDropdown = () => (
        <Dropdown
            className='extraction-dropdown'
            selection
            options={[
                { value: true, text: 'true' },
                { value: false, text: 'false' },
            ]}
            value={value}
            onChange={handleChangeValue}
        />
    );

    const renderSlotInput = inputType => (
        <Input
            className='extraction-field'
            placeholder='enter a value'
            type={inputType}
            value={value}
            onChange={handleChangeValue}
        />
    );

    const renderSlotValue = () => {
        switch (slot.type) {
        case 'categorical':
            return rederCategoricalDropdown();
        case 'bool':
            return renderBoolDropdown();
        case 'text':
            return renderSlotInput('text');
        case 'number':
            return renderSlotInput('number');
        default:
            return renderSlotInput();
        }
    };

    const renderValueFromIntent = () => (
        <div>
            <span>If the intent is</span>
            <Dropdown
                clearable
                className='extraction-dropdown'
                selection
                multiple
                search
                options={intents}
                placeholder='select an intent'
                onChange={handleChangeIntent}
                value={intentCondition === 'include' ? intent : notIntent}
            />
            <span>the value is</span>
            {renderSlotValue()}
        </div>
    );
    return (
        <List.Item>
            <div>
                {index !== 0 && <Divider horizontal className='extraction-item-divider'>OR</Divider>}
                <span>
                    Get the slot value:
                </span>
                <Dropdown
                    className='extraction-dropdown'
                    selection
                    options={[
                        { value: 'from_text', text: 'From the user message' },
                        { value: 'from_intent', text: 'Conditionally on the intent' },
                        { value: 'from_entity', text: 'From the entity' },
                    ]}
                    value={type || 'from_text'}
                    onChange={handleValueSourceChange}
                />
                {type === 'from_intent' && renderValueFromIntent()}
                {type === 'from_entity' && renderSelectEntitiy()}
            </div>
            <div className='extraction-line'>
                <Dropdown
                    clearable
                    placeholder='add a condition'
                    className='extraction-dropdown condition-dropdown'
                    selection
                    options={[
                        { value: 'include', text: 'if the intent is one of' },
                        { value: 'exclude', text: 'if the intent is NOT one of' },
                    ]}
                    value={intentCondition}
                    onChange={handleIntentConditionChange}
                />
                <Dropdown
                    clearable
                    placeholder='select included/excluded intents'
                    className='extraction-dropdown'
                    selection
                    multiple
                    search
                    options={intents}
                    value={intentCondition === 'include' ? intent : notIntent}
                    onChange={handleChangeIntent}
                />
                {/* {type === 'from_intent' && (
                    <div>
                        <span>the value is</span>
                        {renderSlotValue()}
                    </div>
                )} */}
            </div>
        </List.Item>
    );
};

ExtractionItem.propTypes = {
    intents: PropTypes.array.isRequired,
    slotFilling: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    entities: PropTypes.array,
    slot: PropTypes.object,
    index: PropTypes.number.isRequired,
};

ExtractionItem.defaultProps = {
    slotFilling: {},
    entities: [],
    slot: {},
};

export default ExtractionItem;
