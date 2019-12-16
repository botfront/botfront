
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BotResponsesContainer from '../../stories/common/BotResponsesContainer';


const SequenceEditor = (props) => {
    const {
        botResponse,
        language,
    } = props;

    const activeResponse = botResponse.values.find(({ lang }) => lang === language);
    const content = activeResponse
        ? activeResponse.sequence.map(() => (
            <BotResponsesContainer
                deletable
                name={botResponse.key}
                onDeleteAllResponses={() => {}}
                isNew={false}
                removeNewState={() => {}}
                language={language}
            />
        ))
        : <></>;
    return content;
};

SequenceEditor.PropTypes = {
    botResponse: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    language: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(SequenceEditor);
