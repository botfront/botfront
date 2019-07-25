import React, { useContext, useState } from 'react';
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
    const [popupOpen, setPopupOpen] = useState(null);

    const renderAddLine = (i) => {
        if (popupOpen !== i) {
            return (
                <FloatingIconButton
                    icon='ellipsis horizontal'
                    size='medium'
                    onClick={() => setPopupOpen(i)}
                />
            );
        }
        return (
            <BotResponsePopupContent
                onSelect={(r) => { setPopupOpen(null); alert(`${r.name}!!`); }}
                onCreate={(r) => { setPopupOpen(null); alert(`${r}!!`); }}
                onClose={() => setPopupOpen(null)}
                limitedSelection
                disableExisting
                defaultOpen
                trigger={(
                    <FloatingIconButton
                        icon='ellipsis horizontal'
                        visible
                        size='medium'
                        onClick={() => setPopupOpen(i)}
                    />
                )}
            />
        );
    };

    const renderResponse = (r, i, a) => (
        <React.Fragment key={i + r}>
            <div className='flex-right'>
                <div /* start placeholder for bot response container */
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
                </div> {/* start placeholder for bot response container */}
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
            {sequence.map(renderResponse)}
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
