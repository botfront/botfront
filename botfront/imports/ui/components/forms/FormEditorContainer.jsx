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
        slotName,
    } = props;

    const [slotToFill, setSlotToFill] = useState({
        name: slotName,
        slotFilling: [{ type: 'from_text' }],
    });
    const [activeTab, setActiveTab] = useState('question');
    const { slots, responses } = useContext(ProjectContext);
    const slot = slots.find(({ name }) => name === slotToFill.name);
    const response = responses[`utter_ask_${slotName}`];

    useEffect(() => {
        setSlotToFill({ ...slotToFill, name: slotName });
    }, [slotName]);

    const handleChangeSlotFilling = (update, i) => {
        const { slotFilling } = slotToFill;
        const updatedSlotFilling = [...slotFilling];
        updatedSlotFilling[i] = { ...updatedSlotFilling[i], ...update };
        setSlotToFill({ ...slotToFill, slotFilling: updatedSlotFilling });
    };

    const handleAddSlotFilling = () => {
        setSlotToFill({ ...slotToFill, slotFilling: [...slotToFill.slotFilling, { type: 'from_text' }] });
    };

    const renderActiveTab = () => {
        switch (activeTab) {
        case 'question':
            return <QuestionTab slotName={slotName} response={response} />;
        case 'validation':
            return <>validation</>;
        case 'extraction':
            return <ExtractionTab slotSettings={slotToFill.slotFilling} slot={slot} onChange={handleChangeSlotFilling} addSlotFilling={handleAddSlotFilling} />;
        default:
            return <></>;
        }
    };
    console.log('-------------');
    console.log(slotToFill);
    console.log('-------------');
    return (
        <Segment.Group>
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
            <Segment attached='bottom' className='form-settings-tab-container'>
                {renderActiveTab()}
            </Segment>
        </Segment.Group>
    );
};

FormEditorContainer.propTypes = {
    slotName: PropTypes.string.isRequired,
    formName: PropTypes.string.isRequired,
};

export default FormEditorContainer;
