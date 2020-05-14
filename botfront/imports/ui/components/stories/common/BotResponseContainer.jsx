/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import TextareaAutosize from 'react-autosize-textarea';
import ImageThumbnail from './ImageThumbnail';
import CarouselEditor from './CarouselEditor';
import QuickReplies from './QuickReplies';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, focus, onFocus, editCustom, tag, hasMetadata,
    } = props;

    const [input, setInput] = useState();
    const focusGrabber = useRef();
    const isCustom = value.__typename === 'CustomPayload';
    const isTextResponse = value.__typename === 'TextPayload';
    const isQRResponse = value.__typename === 'QuickReplyPayload';
    const isCarouselResponse = value.__typename === 'CarouselPayload';
    const isImageResponse = value.__typename === 'ImagePayload';
    const hasText = Object.keys(value).includes('text') && value.text !== null;


    const unformatNewlines = (response) => {
        if (!response) return response;
        return response.replace(/ {2}\n/g, '\n');
    };

    const formatNewlines = text => text.replace(/\n/g, '  \n');

    useEffect(() => {
        setInput(unformatNewlines(value.text));
        if (focus && focusGrabber.current) focusGrabber.current.focus();
    }, [value.text, focus]);

    const setText = () => onChange({ ...value, text: formatNewlines(input) }, false);
    const setImage = image => onChange({ ...value, image }, false);

    function handleTextBlur(e) {
        const tagRegex = new RegExp(tag);
        if (e.relatedTarget && !!e.relatedTarget.id.match(tagRegex)) return;
        setText();
    }

    const handleKeyDown = (e) => {
        const { key, shiftKey } = e;
        if (key === 'Backspace' && !input) {
            e.preventDefault();
            onDelete();
        }
        if (key === 'Enter' && isTextResponse) {
            if (shiftKey) return;
            e.preventDefault();
            onChange({ text: formatNewlines(input) }, true);
        }
    };

    const renderText = () => (
        <TextareaAutosize
            ref={focusGrabber}
            placeholder='Type a message'
            role='button'
            tabIndex={0}
            value={input}
            onChange={(event) => {
                setInput(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus()}
            onBlur={handleTextBlur}
        />
    );

    const renderButtons = () => (
        <QuickReplies
            value={value.buttons}
            onChange={(buttons) => {
                onChange({ ...value, buttons }, false);
            }}
        />
    );

    const renderCustom = () => (
        <Button
            className='edit-custom-response'
            onClick={() => editCustom()}
            data-cy='edit-custom-response'
        >
            Custom Format Response
        </Button>
    );

    let extraClass = '';
    if (isImageResponse) extraClass = `${extraClass} image-response-container`;
    if (isCarouselResponse) extraClass = `${extraClass} carousel-response-container`;
    const metadataClass = hasMetadata ? 'metadata-response' : '';

    return (
        <div
            className={`utterance-container ${extraClass} ${metadataClass}`}
            agent='bot'
            data-cy='bot-response-input'
        >
            <div className={`${hasMetadata ? 'metadata-response' : ''}`}>
                {hasText && !isImageResponse && renderText()}
                {isImageResponse && <ImageThumbnail value={value.image} onChange={setImage} />}
                {isCarouselResponse && <CarouselEditor value={value} onChange={onChange} />}
                {isQRResponse && renderButtons()}
                {isCustom && renderCustom()}
            </div>
        </div>
    );
};

BotResponseContainer.propTypes = {
    value: PropTypes.object.isRequired,
    focus: PropTypes.bool,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    editCustom: PropTypes.func,
    tag: PropTypes.string,
    hasMetadata: PropTypes.bool,
};

BotResponseContainer.defaultProps = {
    focus: false,
    editCustom: () => {},
    tag: null,
    hasMetadata: false,
};

export default BotResponseContainer;
