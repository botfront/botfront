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
        upsertResponse((response && response.name) || `utter_ask_${slotName}`, content, 0);
    };

    return (
        <div className='response-form'>
            <Header size='small' className='question-tab-header'>
                What question should the assistant ask?
            </Header>
            <BotResponsesContainer
                deletable={false}
                name={(response && response.name) || `utter_ask_${slotName}`}
                initialValue={response}
                onChange={handleResponseChange}
                enableEditPopup
                enableChangeType
                renameable={false}
            />
            <ChangeResponseType name={(response && response.name) || `utter_ask_${slotName}`} currentType={response && response.__typename} />
        </div>
    );
};

QuestionTab.propTypes = {
    response: PropTypes.object,
    slotName: PropTypes.string.isRequired,
};
QuestionTab.defaultProps = {
    response: null,
};

export default QuestionTab;
