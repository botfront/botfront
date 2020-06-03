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
            filling: [{ type: 'from_text' }],
        };
    };

    const [slotToFill, setSlotToFill] = useState(getInitialFilling());
    const [activeTab, setActiveTab] = useState('question');
    const { slots, responses, addResponses } = useContext(ProjectContext);
    const slot = slots.find(({ name }) => name === slotToFill.name);
    const response = responses[`utter_ask_${slotName}`];
    if (!response) addResponses([`utter_ask_${slotName}`]);

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

    const handleAddfilling = () => {
        const update = { ...slotToFill, filling: [...slotToFill.filling, { type: 'from_text' }] };
        setSlotToFill(update);
        onChange(formId, update);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
        case 'question':
            return <QuestionTab slotName={slotName} response={response} />;
        case 'validation':
            return <>validation</>;
        case 'extraction':
            return <ExtractionTab slotSettings={slotToFill.filling} slot={slot} onChange={handleChangefilling} addfilling={handleAddfilling} />;
        default:
            return <></>;
        }
    };

    return (
        <Segment.Group className='story-card'>
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
    slotFillingProp: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default FormEditorContainer;
