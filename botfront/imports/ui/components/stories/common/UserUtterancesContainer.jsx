import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '../../common/IconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import { NEW_INTENT } from '../../../../lib/story_controller';

const BotResponsesContainer = (props) => {
    const {
        deletable, value, onChange, onDelete,
    } = props;

    const handleDeleteDisjunct = (index) => {
        const newUtterance = [...value.slice(0, index), ...value.slice(index + 1)];
        if (newUtterance.length) {
            return onChange([...value.slice(0, index), ...value.slice(index + 1)]);
        }
        return onDelete();
    };

    const handleUpdateDisjunct = (index, content) => {
        const identicalPayload = value
            .filter(v => v)
            .find(
                d => d.intent === content.intent
                    && ((d.entities || []).some(e1 => (content.entities || []).some(
                        e2 => e1.value === e2.value && e1.entity === e2.entity,
                    ))
                        || !(content.entities || []).length),
            );
        if (identicalPayload) return handleDeleteDisjunct(index);
        return onChange([...value.slice(0, index), content, ...value.slice(index + 1)]);
    };

    const handleInsertDisjunct = (index) => {
        onChange([
            ...value.slice(0, index + 1),
            { intent: NEW_INTENT },
            ...value.slice(index + 1),
        ]);
    };

    const renderResponse = (payload, index) => (
        <React.Fragment
            key={payload ? `${payload.intent}${JSON.stringify(payload.entities)}` : 'new'}
        >
            <div className='flex-right'>
                <UserUtteranceContainer
                    deletable={deletable && value.length > 1}
                    value={payload}
                    onInput={content => handleUpdateDisjunct(index, content)}
                    onDelete={() => handleDeleteDisjunct(index)}
                    onAbort={() => handleDeleteDisjunct(index)}
                    onAdd={() => handleInsertDisjunct(index)}
                />
            </div>
        </React.Fragment>
    );

    return (
        <div className='utterances-container exception-wrapper-target'>
            {value.map(renderResponse)}
            <div className='side-by-side right narrow top-right'>
                {deletable && onDelete && <IconButton onClick={onDelete} icon='trash' />}
            </div>
        </div>
    );
};

BotResponsesContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
};

BotResponsesContainer.defaultProps = {
    deletable: true,
    onChange: () => {},
    onDelete: null,
};

export default BotResponsesContainer;
