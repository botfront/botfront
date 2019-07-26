import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import BotResponsePopupContent from './BotResponsePopupContent';
import BotResponseContainer from './BotResponseContainer';
import { ConversationOptionsContext } from '../../utils/Context';

const BotResponsesContainer = (props) => {
    const {
        name, onDeleteResponse, onCreateResponse, onDeleteAllResponses, onChangeResponse,
    } = props;
    const { responses, lang } = useContext(ConversationOptionsContext);
    const sequence = responses
        .filter(r => r.key === name)[0].values
        .filter(v => v.lang === lang)[0].sequence
        .map(r => yamlLoad(r.content));
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
                onSelect={() => {}} // not needed for now
                onCreate={(template) => { setPopupOpen(null); onCreateResponse(i, template); }}
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
                <BotResponseContainer
                    value={r}
                    onDelete={() => onDeleteResponse(i)}
                    onAbort={() => onDeleteResponse(i)}
                    onChange={content => onChangeResponse(i, content)}
                />
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
        <div className='responses-container'>
            {renderAddLine(-1)}
            {sequence.map(renderResponse)}
        </div>
    );
};

BotResponsesContainer.propTypes = {
    name: PropTypes.string.isRequired,
    onDeleteResponse: PropTypes.func.isRequired,
    onCreateResponse: PropTypes.func.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
    onChangeResponse: PropTypes.func.isRequired,
};

BotResponsesContainer.defaultProps = {
};

export default BotResponsesContainer;
