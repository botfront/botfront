import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import { ConversationOptionsContext } from '../../utils/Context';

const BotResponsesContainer = (props) => {
    const { name, onDeleteResponse, onDeleteAllResponses } = props;
    const { responses } = useContext(ConversationOptionsContext);
    const sequence = responses[name];

    const renderAddLine = (i) => {
        const options = ['yo'];
        if (!options.length) return null;
        return (
            <FloatingIconButton icon='ellipsis horizontal' />
        );
    };

    const renderResponse = (r, i, a) => (
        <>
            <div className='flex-right'>
                <div
                    className='utterance-container'
                    agent='bot'
                    key={i + r}
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
        </>
    );

    if (!responses[name].length) onDeleteAllResponses();

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
