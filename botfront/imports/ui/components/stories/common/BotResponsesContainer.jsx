import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import BotResponsePopupContent from './BotResponsePopupContent';
import { ConversationOptionsContext } from '../../utils/Context';

const BotResponsesContainer = (props) => {
    const {
        name, onDeleteResponse, onDeleteAllResponses,
    } = props;
    const { responses } = useContext(ConversationOptionsContext);
    const sequence = responses.filter(r => r.name === name)[0].data;

    const renderAddLine = () => (
        <FloatingIconButton
            icon='ellipsis horizontal'
            size='medium'
        />
    );

    const renderResponse = (r, i, a) => (
        <React.Fragment key={i + r}>
            <div className='flex-right'>
                <div
                    className='utterance-container'
                    agent='bot'
                >
                    <div className='inner'>
                        { r }
                    </div>
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => onDeleteResponse(i)}
                    />
                </div>
                { i === 0 && a.length > 1 && (
                    <FloatingIconButton
                        icon='trash'
                        onClick={onDeleteAllResponses}
                    />
                )}
                { i === a.length - 1 && (
                    <div className='response-name'>
                        {name}
                    </div>
                )}
            </div>
            {renderAddLine(i)}
        </React.Fragment>
    );

    if (sequence && !sequence.length) onDeleteAllResponses();

    return (
        <div
            className='responses-container'
        >
            {renderAddLine(-1)}
            {sequence.map((r, i, a) => renderResponse(r, i, a))}
        </div>
    );
};

BotResponsesContainer.propTypes = {
    name: PropTypes.string.isRequired,
    onDeleteResponse: PropTypes.func.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
};

BotResponsesContainer.defaultProps = {
};

export default BotResponsesContainer;
