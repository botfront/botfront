import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Icon, Button } from 'semantic-ui-react';

import { safeLoad } from 'js-yaml';

import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import CustomResponseEditor from '../common/CustomResponseEditor';
import IconButton from '../../common/IconButton';

import { addContentType, defaultTemplate } from '../botResponse.utils';

const SequenceEditor = (props) => {
    const {
        sequence,
        onChange,
        onDeleteVariation,
    } = props;

    const getContent = (variation) => {
        const content = safeLoad(variation.content);
        return content.__typename ? content : addContentType(content);
    };

    const renderVariation = (variation, index) => {
        const content = getContent(variation);
        if (!content) return <></>;
        return (
            <Segment className='variation-container' attached key={`variation-${index}-${content.text}`}>
                { (content.__typename === 'TextPayload'
                    || content.__typename === 'QuickReplyPayload'
                    || content.__typename === 'ImagePayload') && (
                    <BotResponsesContainer
                        deleteable
                        initialValue={content}
                        onChange={value => onChange(value, index)}
                        isNew={false}
                        enableEditPopup={false}
                    />
                )}
                {content.__typename === 'CustomPayload' && (
                    <CustomResponseEditor
                        content={content}
                        onChange={value => onChange(value, index)}
                    />
                )}
                <div>
                    {/* <Icon name='star' color='yellow' float='right' /> */}
                    <IconButton
                        onClick={() => {
                            if (sequence.length === 1) {
                                const blankTemplate = defaultTemplate(content.__typename);
                                onChange(blankTemplate, 0);
                                return;
                            }
                            onDeleteVariation(index);
                        }}
                        icon='trash'
                    />
                </div>
            </Segment>
        );
    };
    return <>{sequence.map(renderVariation)}</>;
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteVariation: PropTypes.func.isRequired,
};

export default SequenceEditor;
