/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Image } from 'semantic-ui-react';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, focus, onFocus, editCustom, tag, hasMetadata,
    } = props;

    const [input, setInput] = useState();
    const [shiftPressed, setshiftPressed] = useState(false);
    const focusGrabber = useRef();
    const isCustom = value.__typename === 'CustomPayload';
    const isTextResponse = value.__typename === 'TextPayload';
    const isQRResponse = value.__typename === 'QuickReplyPayload';
    const isImageResponse = value.__typename === 'ImagePayload';
    const hasText = Object.keys(value).includes('text') && value.text !== null;

    const imageUrlRef = useRef();

    const unformatNewlines = (response) => {
        if (!response) return response;
        return response.replace(/ {2}\n/g, '\n');
    };

    const formatNewlines = text => text.replace(/\n/g, '  \n');

    useEffect(() => {
        setInput(unformatNewlines(value.text));
        if (focus && focusGrabber.current) focusGrabber.current.focus();
        if (focus && imageUrlRef.current) imageUrlRef.current.focus();
    }, [value.text, focus]);


    function handleTextBlur(e) {
        const tagRegex = new RegExp(tag);
        if (e.relatedTarget && !!e.relatedTarget.id.match(tagRegex)) return;
        if (isTextResponse) onChange({ text: formatNewlines(input) }, false);
        if (isQRResponse) onChange({ text: formatNewlines(input), buttons: value.buttons }, false);
        if (isImageResponse) onChange({ text: formatNewlines(input), image: value.image }, false);
    }

    const setImage = image => onChange({ ...value, image, text: '' }, false);

    const setImageFromUrlBox = () => setImage(imageUrlRef.current.inputRef.current.value);

    const handleKeyDown = (e) => {
        if (e.key === 'Shift') {
            setshiftPressed(true);
        }
        if (e.key === 'Backspace' && !input) {
            e.preventDefault();
            onDelete();
        }
        if (e.key === 'Enter' && isTextResponse) {
            if (shiftPressed) {
                return;
            }
            e.preventDefault();
            onChange({ text: formatNewlines(input) }, true);
        }
        if (e.key === 'Enter' && isImageResponse) {
            e.preventDefault();
            setImageFromUrlBox();
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Shift') {
            setshiftPressed(false);
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
            onKeyUp={handleKeyUp}
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

    const renderViewImage = () => (
        <Image src={value.image} size='small' alt=' ' />
    );

    const renderSetImage = () => (
        <div>
            <b>Insert image from URL</b>
            <br />
            <div className='side-by-side'>
                <Input
                    ref={imageUrlRef}
                    autoFocus
                    placeholder='URL'
                    onBlur={setImageFromUrlBox}
                    onKeyDown={handleKeyDown}
                    size='small'
                    data-cy='image-url-input'
                    className='image-url-input'
                />
                <Button primary onClick={setImageFromUrlBox} size='small' content='Save' />
            </div>
        </div>
    );

    const renderImage = () => (!value.image.trim() ? renderSetImage() : renderViewImage());

    const renderCustom = () => (
        <Button
            className='edit-custom-response'
            onClick={() => editCustom()}
            data-cy='edit-custom-response'
        >
            Custom Format Response
        </Button>
    );

    const extraClass = isImageResponse && value.image.trim() ? 'image' : '';
    const metadataClass = hasMetadata ? 'metadata-response' : '';


    return (
        <div
            className={`utterance-container ${extraClass} ${metadataClass}`}
            agent='bot'
            data-cy='bot-response-input'
        >
            <div className={`${hasMetadata ? 'metadata-response' : ''}`}>
                {hasText && !isImageResponse && renderText()}
                {isImageResponse && renderImage()}
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
