import React, { useState, useContext, useEffect } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { ProjectContext } from '../../layouts/context';
import ExtractionTab from './ExtractionTab';
import ValidationTab from './ValidationTab';
import FormTopMenu from './FormTopMenu';

const FormEditorContainer = (props) => {
    const {
        formId,
        slotName,
        slotFillingProp,
        onChange,
    } = props;


    const getSlotSettings = () => {
        if (slotFillingProp) return { ...slotFillingProp };
        return {
            name: slotName,
            filling: [{ type: 'from_entity' }],
        };
    };

    const slotSettings = getSlotSettings();

    const [activeTab, setActiveTab] = useState('extraction');
    const {
        slots, responses, addResponses, language,
    } = useContext(ProjectContext);
    const slot = slots.find(({ name }) => name === slotSettings.name);

    useEffect(() => {
        addResponses([`utter_valid_${slotName}`]);
        addResponses([`utter_invalid_${slotName}`]);
    }, [language, slotName]);

    const getResponse = (responseName) => {
        const response = responses[responseName];
        return response;
    };

    const validResponse = getResponse(`utter_valid_${slotName}`);
    const invalidResponse = getResponse(`utter_invalid_${slotName}`);

    const handleChange = (update) => {
        onChange(formId, update);
    };

    const handleChangefilling = (update, i) => {
        const { filling } = slotSettings;
        const updatedfilling = [...filling];
        updatedfilling[i] = { ...updatedfilling[i], ...update };
        const updateData = { ...slotSettings, filling: updatedfilling };
        handleChange(updateData);
    };

    const handleAddCondition = () => {
        const update = { ...slotSettings, filling: [...slotSettings.filling, { type: 'from_text' }] };
        handleChange(update);
    };

    const handleDeleteCondition = (index) => {
        const conditions = slotSettings.filling;
        const result = [...conditions.slice(0, index), ...conditions.slice(index + 1, slotSettings.length)];
        const update = { ...slotSettings, filling: result };
        handleChange(update);
    };

    const handleChangeValidation = (validation) => {
        const newSlotToFill = { ...slotSettings, validation };
        handleChange(newSlotToFill);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
        case 'validation':
            return (
                <ValidationTab
                    slotName={slotName}
                    validation={slotSettings.validation}
                    validResponse={validResponse}
                    invalidResponse={invalidResponse}
                    onChange={handleChangeValidation}
                    utterOnNewValidSlot={!!slotSettings.utter_on_new_valid_slot}
                    onToggleUtterValidSlot={() => {
                        handleChange({
                            ...slotSettings,
                            utter_on_new_valid_slot: !slotSettings.utter_on_new_valid_slot,
                        });
                    }}
                />
            );
        case 'extraction':
            return (
                <ExtractionTab
                    slotSettings={slotSettings.filling}
                    slot={slot}
                    onChange={handleChangefilling}
                    addCondition={handleAddCondition}
                    deleteCondition={handleDeleteCondition}
                />
            );
        default:
            return <></>;
        }
    };
    return (
        <Segment.Group className='story-card' key={`form-editor-${language}`}>
            <FormTopMenu
                menuItems={[
                    { value: 'extraction', text: 'Extraction' },
                    { value: 'validation', text: 'Validation' },
                ]}
                activeItem={activeTab}
                setActiveItem={setActiveTab}
            />
            <span className='slot-name'>{slotName}</span>
            <Segment attached='bottom' className='form-settings-tab-container story-card-content'>
                {renderActiveTab()}
            </Segment>
        </Segment.Group>
    );
};

FormEditorContainer.propTypes = {
    slotName: PropTypes.string.isRequired,
    formId: PropTypes.string.isRequired,
    slotFillingProp: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default FormEditorContainer;
