
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

    const renderContent = () => {
        if (!activeResponse) return <></>;
        if (!activeResponse.sequence) {
            return (
                <BotResponsesContainer
                    deletable
                    name={botResponse.key}
                    onDeleteAllResponses={() => {}}
                    isNew={false}
                    removeNewState={() => {}}
                    language={language}
                />
            );
        }
        return (
            <BotResponsesContainer
                deletable
                name={botResponse.key}
                onDeleteAllResponses={() => {}}
                isNew={false}
                removeNewState={() => {}}
                language={language}
            />
        );
    };
    return renderContent();
};

SequenceEditor.PropTypes = {
    botResponse: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    language: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(SequenceEditor);
