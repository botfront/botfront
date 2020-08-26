import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import IconButton from '../../common/IconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import UserUtterancePopupContent from './UserUtterancePopupContent';
import { NEW_INTENT } from '../../../../lib/story_controller';

const UserUtterancesContainer = (props) => {
    const {
        deletable, value, onChange, onDelete,
    } = props;

    const somethingIsBeingInput = useMemo(() => value.some(disjunct => disjunct === null), [value]);

    const handleDeleteDisjunct = (index) => {
        if (value.length > 1) {
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

    const handleInsertDisjunct = (index, payload) => {
        onChange([
            ...value.slice(0, index + 1),
            payload || { intent: NEW_INTENT },
            ...value.slice(index + 1),
        ]);
    };

    const renderResponse = (payload, index) => (
        <React.Fragment
            key={payload ? `${payload.intent}${JSON.stringify(payload.entities)}` : 'new'}
        >
            <div className='story-line'>
                <UserUtteranceContainer
                    value={payload}
                    onInput={content => handleUpdateDisjunct(index, content)}
                    onAbort={() => { if (value.length > 1) handleDeleteDisjunct(index); }}
                    onDelete={() => { handleDeleteDisjunct(index); }}
                />
                {payload && index !== value.length - 1 && (
                    <IconButton icon='add' className='or-label' color='vk' />
                )}
                {!somethingIsBeingInput && index === value.length - 1 && (
                    <UserUtterancePopupContent
                        trigger={<IconButton icon='add' className='or-icon-button' />}
                        onCreateFromInput={() => handleInsertDisjunct(index)}
                        onCreateFromPayload={selectedPayload => handleInsertDisjunct(index, selectedPayload)}
                    />
                )}
                {deletable
                    && (!somethingIsBeingInput || !payload)
                    && value.length > 1 && (
                    <IconButton
                        onClick={() => handleDeleteDisjunct(index)}
                        icon='trash'
                    />
                )}
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

UserUtterancesContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
};

UserUtterancesContainer.defaultProps = {
    deletable: true,
    onChange: () => {},
    onDelete: null,
};

export default UserUtterancesContainer;
