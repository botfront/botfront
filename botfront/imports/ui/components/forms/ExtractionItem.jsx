import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, List, Divider, Input,
} from 'semantic-ui-react';
import { can } from '../../../lib/scopes';
import IconButton from '../common/IconButton';
import SequenceSelector from '../common/SequenceSelector';
import EntityDropdown from '../nlu/common/EntityDropdown';
import EntityValueEditor from '../stories/common/EntityValueEditor';

const ExtractionItem = (props) => {
    const {
        slotFilling: {
            type = 'from_text',
            entity,
            group,
            role,
            intent,
            not_intent: notIntent,
            value,
        },
        slotFilling,
        slot,
        onChange,
        onDelete,
        index,
        projectId,
    } = props;

    const canEdit = can('stories:w', projectId);
    const intentCondition = useMemo(() => {
        if (Array.isArray(intent)) return 'include';
        if (Array.isArray(notIntent)) return 'exclude';
        return type === 'from_intent' ? 'include' : null;
    }, [slotFilling]);

    const handleIntentConditionChange = (e, { value: selectedCondition }) => {
        if (selectedCondition === intentCondition) return;
        if (!selectedCondition) onChange({ intent: null, not_intent: null });
        if (selectedCondition === 'include') onChange({ intent: notIntent || [], not_intent: null });
        if (selectedCondition === 'exclude') onChange({ intent: null, not_intent: intent || [] });
    };

    const handleChangeIntent = (intentSelection) => {
        const update = intentCondition === 'include'
            ? { intent: intentSelection }
            : { not_intent: intentSelection };
        onChange(update);
    };

    const handleValueSourceChange = (e, { value: source }) => {
        onChange({
            type: source, value: null, entity: null, role: null, group: null,
        });
    };

    const handleChangeValue = (e, { value: newValue }) => {
        onChange({
            value: newValue, entity: null, role: null, group: null,
        });
    };

    const handleChangeEntity = (newValue) => {
        if (!newValue) {
            onChange({ entity: null });
            return;
        }
        onChange({ value: null, entity: [newValue] });
    };

    const handleChangeEntityValue = ({ role: newRole, group: newGroup }) => {
        onChange({
            role: newRole || newRole === '' ? [newRole] : null,
            group: newGroup || newGroup === '' ? [newGroup] : null,
        });
    };

    const getValueFromArray = arrayValue => (Array.isArray(arrayValue) ? arrayValue[0] : null);

    const renderSelectEntitiy = () => (
        <div className='entity-selector-container'>
            <EntityDropdown
                entity={entity ? { entity: entity[0] } : null}
                allowAdditions
                onAddItem={handleChangeEntity}
                onChange={handleChangeEntity}
            />
            <EntityValueEditor
                entity={{
                    role: getValueFromArray(role),
                    group: getValueFromArray(group),
                }}
                onChange={handleChangeEntityValue}
                disallowValueEditing
            />
        </div>
    );

    const renderCategoricalDropdown = () => {
        const { categories } = slot;
        return (
            <Dropdown
                disabled={!canEdit}
                data-cy='category-value-dropdown'
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
            disabled={!canEdit}
            data-cy='bool-value-dropdown'
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
            disabled={!canEdit}
            data-cy='slot-value-input'
            className='extraction-field'
            placeholder='enter a value'
            type={inputType}
            value={value || ''}
            onChange={handleChangeValue}
        />
    );

    const renderSlotValue = () => {
        switch (slot.type) {
        case 'categorical':
            return renderCategoricalDropdown();
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
    const renderIntentSelect = () => (
        <div className='extraction-line extraction-intents-line' key={`extraction-condition-${index}`}>
            <Dropdown
                disabled={!canEdit}
                data-cy='intent-condition-dropdown'
                clearable={type !== 'from_intent'}
                placeholder='add an intent condition'
                className='extraction-dropdown condition-dropdown'
                selection
                options={[
                    { value: 'include', text: 'if the intent is one of' },
                    { value: 'exclude', text: 'if the intent is NOT one of' },
                ]}
                value={intentCondition}
                onChange={handleIntentConditionChange}
            />
            <br />
            {intentCondition && (
                <SequenceSelector
                    sequence={(intentCondition === 'include' ? intent : notIntent) || []}
                    onChange={(v) => {
                        handleChangeIntent(v);
                    }}
                    actionOptions={[]}
                    slotOptions={[]}
                    allowedEventTypes={['intent']}
                    bordered
                    width={12}
                    enableExclusions={false}
                    direction='left'
                />
            )}
        </div>
    );

    const renderValueFromIntent = () => (
        <div className='value-from-intent'>
            {renderIntentSelect()}
            <span>Then the value is</span>
            {renderSlotValue()}
        </div>
    );

    return (
        <List.Item className={`extraction-item-container ${canEdit ? '' : 'read-only'}`} data-cy='extraction-item-container'>
            {index !== 0 && <Divider horizontal className='extraction-item-divider'>OR</Divider>}
            <div className='extraction-option-buttons'>
                {canEdit && <IconButton icon='trash' color='grey' onClick={() => onDelete(index)} />}
            </div>
            <div className={`extraction-line ${type || 'from_text'}`}>
                <span className='slot-value-from'>
                    Get the slot value
                </span>
                <Dropdown
                    disabled={!canEdit}
                    data-cy='extraction-source-dropdown'
                    className='extraction-dropdown'
                    inline
                    options={[
                        { value: 'from_text', text: 'from the user message' },
                        { value: 'from_intent', text: 'conditionally on the intent' },
                        { value: 'from_entity', text: 'from the entity' },
                    ]}
                    value={type || 'from_text'}
                    onChange={handleValueSourceChange}
                />
                {type === 'from_intent' && renderValueFromIntent()}
                {type === 'from_entity' && renderSelectEntitiy()}
            </div>
            {type !== 'from_intent' && renderIntentSelect()}
        </List.Item>
    );
};

ExtractionItem.propTypes = {
    slotFilling: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    slot: PropTypes.object,
    index: PropTypes.number.isRequired,
    onDelete: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

ExtractionItem.defaultProps = {
    slotFilling: {},
    slot: {},
};

export default ExtractionItem;
