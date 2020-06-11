import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Segment } from 'semantic-ui-react';
import FormTopMenu from './FormTopMenu';
import QuestionTab from './QuestionTab';
import ExtractionTab from './ExtractionTab';
import { ProjectContext } from '../../layouts/context';

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
    const response = responses[`utter_ask_${slotName}`];
    if (!response) addResponses([`utter_ask_${slotName}`]);
    useEffect(() => {
        addResponses([`utter_ask_${slotName}`]);
    }, [language]);

    useEffect(() => {
        setSlotToFill({ ...slotToFill, name: slotName });
    }, [slotName]);

    const handleChangefilling = (update, i) => {
        const { filling } = slotToFill;
        const updatedfilling = [...filling];
        updatedfilling[i] = { ...updatedfilling[i], ...update };
        const updateData = { ...slotToFill, filling: updatedfilling };
        setSlotToFill(updateData);
        onChange(formId, updateData);
    };

    const handleAddCondition = () => {
        const update = { ...slotToFill, filling: [...slotToFill.filling, { type: 'from_entity' }] };
        setSlotToFill(update);
        onChange(formId, update);
    };

    const handleDeleteCondition = (index) => {
        const conditions = slotToFill.filling;
        const result = [...conditions.slice(0, index), ...conditions.slice(index + 1, slotToFill.length)];
        const update = { ...slotToFill, filling: result };
        setSlotToFill(update);
        onChange(formId, update);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
        case 'question':
            return <QuestionTab slotName={slotName} response={response} language={language} />;
        case 'validation':
            return <>validation</>;
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
