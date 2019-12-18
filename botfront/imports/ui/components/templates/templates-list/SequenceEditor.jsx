
import React from 'react';

import { safeLoad } from 'js-yaml';
import PropTypes from 'prop-types';
import BotResponsesContainer from '../../stories/common/BotResponsesContainer';


const SequenceEditor = (props) => {
    const {
        sequence,
        onChange,
    } = props;

    const renderContent = () => {
        if (!sequence) return <></>;
        return (
            <BotResponsesContainer
                deleteable
                initialValue={safeLoad(sequence[0].content)}
                onChange={onChange}
                isNew={false}
            />
        );
    };
    return renderContent();
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func,
};
SequenceEditor.defaultProps = {
    onChange: undefined,
};

export default SequenceEditor;
