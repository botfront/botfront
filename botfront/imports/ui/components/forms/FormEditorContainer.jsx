import React, { useState, useContext, useEffect } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';

import { ProjectContext } from '../../layouts/context';
import ExtractionTab from './ExtractionTab';
import ValidationTab from './ValidationTab';
import FormTopMenu from './FormTopMenu';
import QuestionTab from './QuestionTab';

const FormEditorContainer = (props) => {
    const {
        formName,
        formId,
        slotName,
        slotFillingProp,
        onChange,
    } = props;


    const getInitialFilling = () => {
        if (slotFillingProp) return slotFillingProp;
        return {
            name: slotName,
            filling: [{ type: 'from_entity' }],
        };
    };

    const [slotToFill, setSlotToFill] = useState(getInitialFilling());
    const [activeTab, setActiveTab] = useState('question');
    const {
        slots, responses, addResponses, language,
    } = useContext(ProjectContext);
    const slot = slots.find(({ name }) => name === slotToFill.name);

    useEffect(() => {
        addResponses([`utter_ask_${slotName}`]);
        addResponses([`utter_valid_${slotName}`]);
        addResponses([`utter_invalid_${slotName}`]);
    }, [language]);

    const getOrAddResponse = (responseName) => {
        const response = responses[responseName];
        if (!response) addResponses([responseName]);
        return response;
    };

    const response = getOrAddResponse(`utter_ask_${slotName}`);
    const validResponse = getOrAddResponse(`utter_valid_${slotName}`);
    const invalidResponse = getOrAddResponse(`utter_invalid_${slotName}`);

    useEffect(() => {
        setSlotToFill({ ...slotToFill, name: slotName });
    }, [slotName]);

    const handleChange = (update) => {
        setSlotToFill(update);
        onChange(formId, update);
    };

    const handleChangefilling = (update, i) => {
        const { filling } = slotToFill;
        const updatedfilling = [...filling];
        updatedfilling[i] = { ...updatedfilling[i], ...update };
        const updateData = { ...slotToFill, filling: updatedfilling };
        handleChange(updateData);
    };

    const handleAddCondition = () => {
        const update = { ...slotToFill, filling: [...slotToFill.filling, { type: 'from_entity' }] };
        handleChange(update);
    };

    const handleDeleteCondition = (index) => {
        const conditions = slotToFill.filling;
        const result = [...conditions.slice(0, index), ...conditions.slice(index + 1, slotToFill.length)];
        const update = { ...slotToFill, filling: result };
        handleChange(update);
    };

    const handleChangeValidation = (validation) => {
        const newSlotToFill = { ...slotToFill, validation };
        handleChange(newSlotToFill);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
        case 'question':
            return <QuestionTab slotName={slotName} response={response} language={language} />;
        case 'validation':
            return (
                <ValidationTab
                    slotName={slotName}
                    validation={slotToFill.validation}
                    validResponse={validResponse}
                    invalidResponse={invalidResponse}
                    onChange={handleChangeValidation}
                    utterOnNewValidSlot={!!slotToFill.utter_on_new_valid_slot}
                    onToggleUtterValidSlot={() => {
                        handleChange({
                            ...slotToFill,
                            utter_on_new_valid_slot: !slotToFill.utter_on_new_valid_slot,
                        });
                    }}
                />
            );
        case 'extraction':
            return (
                <ExtractionTab
                    slotSettings={slotToFill.filling}
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
                formName={formName}
                slotName={slotToFill.name}
                menuItems={[
                    { value: 'question', text: 'Question' },
                    { value: 'validation', text: 'Validation' },
                    { value: 'extraction', text: 'Extraction' },
                ]}
                activeItem={activeTab}
                setActiveItem={setActiveTab}
            />
            <Segment attached='bottom' className='form-settings-tab-container story-card-content'>
                {renderActiveTab()}
            </Segment>
        </Segment.Group>
    );
};

FormEditorContainer.propTypes = {
    slotName: PropTypes.string.isRequired,
    formName: PropTypes.string.isRequired,
    formId: PropTypes.string.isRequired,
    slotFillingProp: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default FormEditorContainer;
