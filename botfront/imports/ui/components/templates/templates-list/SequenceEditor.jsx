
import React from 'react';

import { safeLoad } from 'js-yaml';
import PropTypes from 'prop-types';
import { addContentType } from '../botResponse.utils';
import BotResponsesContainer from '../../stories/common/BotResponsesContainer';


const SequenceEditor = (props) => {
    const {
        sequence,
        onChange,
    } = props;
    const getContent = (variation) => {
        const content = safeLoad(variation.content);
        return content.__typename ? content : addContentType(content);
    };
    const renderContent = () => {
        if (!sequence) return <></>;
        return (
            <BotResponsesContainer
                deleteable
                initialValue={getContent(sequence[0])}
                onChange={onChange}
                isNew={false}
                enableEditPopup={false}
            />
        );
    };
    return renderContent();
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SequenceEditor;
