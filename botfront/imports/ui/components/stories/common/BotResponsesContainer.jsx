import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import { ConversationOptionsContext } from '../../utils/Context';
import BotResponsePopupContent from './BotResponsePopupContent';
import BotResponseContainer from './BotResponseContainer';

const BotResponsesContainer = (props) => {
    const {
        name,
        onDeleteAllResponses,
        deletable,
    } = props;
    const {
        language, getResponse, updateResponse, insertResponse,
    } = useContext(
        ConversationOptionsContext,
    );

    useEffect(() => {
        if (!/^(utter_)/.test(name)) return;
        getResponse(name, (err, res) => {
            console.log(err, res);
        });
    }, []);

    // const sequence = responses
    //     .filter(r => r.key === name)[0]
    //     .values.filter(v => v.lang === lang)[0]
    //     .sequence.map(r => yamlLoad(r.content));
    const [popupOpen, setPopupOpen] = useState(null);

    const renderAddLine = (index) => {
        if (popupOpen !== index) {
            return (
                <FloatingIconButton
                    icon='ellipsis horizontal'
                    size='medium'
                    onClick={() => setPopupOpen(index)}
                />
            );
        }
        return (
            <BotResponsePopupContent
                onSelect={() => {}} // not needed for now
                onCreate={(template) => {
                    setPopupOpen(null);
                    onCreateResponse(index, template);
                }}
                onClose={() => setPopupOpen(null)}
                limitedSelection
                disableExisting
                defaultOpen
                trigger={(
                    <FloatingIconButton
                        icon='ellipsis horizontal'
                        visible
                        size='medium'
                        onClick={() => setPopupOpen(index)}
                    />
                )}
            />
        );
    };

    const renderResponse = (response, index, sequenceArray) => (
        <React.Fragment key={index}>
            <div className='flex-right'>
                <BotResponseContainer
                    deletable={deletable || sequenceArray.length > 1}
                    value={response}
                    onDelete={() => {}}
                    onAbort={() => {}}
                    onChange={content => {}}
                />
                {index === 0 && deletable && sequenceArray.length > 1 && (
                    <FloatingIconButton icon='trash' onClick={onDeleteAllResponses} />
                )}
                {index === sequenceArray.length - 1 && <div className='response-name'>{name}</div>}
            </div>
            {renderAddLine(index)}
        </React.Fragment>
    );

    // if (sequence && !sequence.length) onDeleteAllResponses();
    return (
        <div className='responses-container'>
            {renderAddLine(-1)}
            {/* {sequence.map(renderResponse)} */}
        </div>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onDeleteAllResponses: PropTypes.func.isRequired,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
};

export default BotResponsesContainer;
