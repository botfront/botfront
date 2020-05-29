import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import { ProjectContext } from '../../layouts/context';
import BotResponsesContainer from '../stories/common/BotResponsesContainer';
import ChangeResponseType from './ChangeResponseType';

const QuestionTab = (props) => {
    const {
        response,
        slotName,
    } = props;

    const { upsertResponse } = useContext(ProjectContext);

    const handleResponseChange = (content) => {
        upsertResponse((response && response.name) || `utter_ask_${slotName}`, content);
    };

    const getDefaultResponse = () => ({
        __typename: 'TextPayload',
        text: 'please enter the value for this slot',
        name: `utter_ask_${slotName}`,
    });

    return (
        <>
            <Header size='small' className='question-tab-header'>
                What question should the assistant ask?
            </Header>
            <BotResponsesContainer
                deletable={false}
                name={(response && response.name) || `utter_ask_${slotName}`}
                initialValue={response || getDefaultResponse()}
                onChange={handleResponseChange}
                enableEditPopup
                enableChangeType
            />
            <ChangeResponseType name={(response && response.name) || `utter_ask_${slotName}`} currentType={response && response.__typename} />
        </>
    );
};

QuestionTab.propTypes = {
    response: PropTypes.object,
    slotName: PropTypes.string,
};
QuestionTab.defaultProps = {

};

export default QuestionTab;
