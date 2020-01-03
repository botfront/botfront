
import React from 'react';

import { safeLoad } from 'js-yaml';
import PropTypes from 'prop-types';


import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import CustomResponseEditor from '../common/CustomResponseEditor';

import { addContentType } from '../botResponse.utils';

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
        const content = getContent(sequence[0]);
        if (!sequence) return <></>;
        return (
            <>
                { (content.__typename === 'TextPayload' || content.__typename === 'QuickReplyPayload') && (
                    <BotResponsesContainer
                        deleteable
                        initialValue={content}
                        onChange={onChange}
                        isNew={false}
                        enableEditPopup={false}
                    />
                )}
                {content.__typename === 'CustomPayload' && (
                    <CustomResponseEditor
                        content={content}
                        onChange={onChange}
                    />
                )}
            </>
        );
    };
    return renderContent();
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SequenceEditor;
