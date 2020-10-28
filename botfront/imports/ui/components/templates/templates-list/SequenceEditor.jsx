/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Message } from 'semantic-ui-react';

import { safeLoad } from 'js-yaml';

import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import CustomResponseEditor from '../common/CustomResponseEditor';
import IconButton from '../../common/IconButton';
import ButtonTypeToggle from '../common/ButtonTypeToggle';

import { addContentType, defaultTemplate } from '../../../../lib/botResponse.utils';

const SequenceEditor = (props) => {
    const {
        name, sequence, onChange, onDeleteVariation, onChangePayloadType,
    } = props;

    const getContent = (variation) => {
        const content = safeLoad((variation || {}).content);
        return content.__typename ? content : addContentType(content);
    };

    const renderVariation = (variation, index) => {
        const content = getContent(variation);
        if (!content) return <></>;
        return (
            <Segment
                className='variation-container'
                attached
                key={`variation-${index}-${content.text}`}
                data-cy='variation-container'
            >
                <>
                    {content.__typename !== 'CustomPayload' && (
                        <BotResponsesContainer
                            deleteable
                            initialValue={content}
                            onChange={value => onChange(value, index)}
                            enableEditPopup={false}
                            tag={`${name}-${index}`}
                        />
                    )}
                    {content.__typename === 'CustomPayload' && (
                        <CustomResponseEditor
                            content={content}
                            onChange={value => onChange(value, index)}
                        />
                    )}
                    <div className='variation-option-menu'>
                        {/* <Icon name='star' color='yellow' float='right' /> */}
                        <ButtonTypeToggle
                            onToggleButtonType={() => {
                                if (content.__typename === 'TextWithButtonsPayload') {
                                    onChangePayloadType('QuickRepliesPayload');
                                }
                                if (content.__typename === 'QuickRepliesPayload') {
                                    onChangePayloadType('TextWithButtonsPayload');
                                }
                            }}
                            responseType={content.__typename}
                        />
                        <IconButton
                            id={`delete-${name}-${index}`} // stop the response from saving if the input blur event is the delete button
                            onClick={() => {
                                if (sequence.length === 1) {
                                    const blankTemplate = defaultTemplate(
                                        content.__typename,
                                    );
                                    onChange({ payload: blankTemplate }, 0);
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
    return (
        <>
            {sequence.some(s => getContent(s).__typename === 'CustomPayload') && (
                <Message
                    info
                    style={{ margin: '10px' }}
                    content={(
                        <>
                            By convention, everything under the{' '}
                            <b className='monospace'>custom</b> key will be dispatched by Rasa{' '}
                            <i>as is</i>, while content under other top-level keys may be
                            formatted according to rules specific to the output channel.
                        </>
                    )}
                />
            )}
            {sequence.map(renderVariation)}
        </>
    );
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteVariation: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChangePayloadType: PropTypes.string.isRequired,
};

export default SequenceEditor;
