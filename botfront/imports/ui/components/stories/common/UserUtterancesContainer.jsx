import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '../../common/IconButton';
import UserUtteranceContainer from './UserUtteranceContainer';

const BotResponsesContainer = (props) => {
    const {
        deletable,
        value,
        onChange,
        onDelete,
    } = props;

    const handleUpdateUtterance = (index, content) => {
        onChange([...value.slice(0, index), content, ...value.slice(index + 1)]);
    };

    const handleDeleteUtterance = (index) => {
        const newUtterance = [...value.slice(0, index), ...value.slice(index + 1)];
        if (newUtterance.length) return onChange([...value.slice(0, index), ...value.slice(index + 1)]);
        return onDelete();
    };
    
    const renderResponse = (payload, index) => (
        <React.Fragment
            key={`${payload ? payload.text : 'new'}${index}`}
        >
            <div className='flex-right'>
                <UserUtteranceContainer
                    deletable={deletable && value.length > 1}
                    value={payload}
                    onInput={content => handleUpdateUtterance(index, content)}
                    onDelete={() => handleDeleteUtterance(index)}
                    onAbort={() => handleDeleteUtterance(index)}
                />
            </div>
        </React.Fragment>
    );

    return (
        <div className='utterances-container exception-wrapper-target'>
            {value.map(renderResponse)}
            <div className='side-by-side right narrow top-right'>
                { deletable && onDelete && (
                    <IconButton onClick={onDelete} icon='trash' />
                )}
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
