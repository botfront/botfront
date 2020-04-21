import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

import { safeLoad } from 'js-yaml';

import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import CustomResponseEditor from '../common/CustomResponseEditor';
import IconButton from '../../common/IconButton';

import { addContentType, defaultTemplate } from '../../../../lib/botResponse.utils';

const SequenceEditor = (props) => {
    const {
        name,
        sequence,
        onChange,
        onDeleteVariation,
    } = props;

    const getContent = (variation) => {
        const content = safeLoad((variation || {}).content);
        return content.__typename ? content : addContentType(content);
    };

    const renderVariation = (variation, index) => {
        const content = getContent(variation);
        if (!content) return <></>;
        return (
            <Segment className='variation-container' attached key={`variation-${index}-${content.text}`} data-cy='variation-container'>
                <>
                    {(content.__typename === 'TextPayload'
                    || content.__typename === 'QuickReplyPayload'
                    || content.__typename === 'ImagePayload') && (
                        <BotResponsesContainer
                            deleteable
                            initialValue={content}
                            onChange={value => onChange(value, index)}
                            isNew={false}
                            enableEditPopup={false}
                            tag={`${name}-${index}`}
                        />
                    )}
                    {(content.__typename === 'CustomPayload' || content.__typename === 'CarouselPayload') && (
                        <CustomResponseEditor
                            content={content}
                            onChange={value => onChange(value, index)}
                        />
                    )}
                    <div className='variation-option-menu'>
                        {/* <Icon name='star' color='yellow' float='right' /> */}
                        <IconButton
                            id={`delete-${name}-${index}`} // stop the response from saving if the input blur event is the delete button
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
                </>
            </Segment>
        );
    };
    return <>{sequence.map(renderVariation)}</>;
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteVariation: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

export default SequenceEditor;
