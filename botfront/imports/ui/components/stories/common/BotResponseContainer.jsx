/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Image } from 'semantic-ui-react';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import FloatingIconButton from '../../common/FloatingIconButton';


const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable, focus, onFocus, editCustom,
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


    function handleTextBlur() {
        if (isTextResponse) onChange({ text: formatNewlines(input) }, false);
        if (isQRResponse) onChange({ text: formatNewlines(input), buttons: value.buttons }, false);
        if (isImageResponse) onChange({ text: formatNewlines(input), image: value.image }, false);
    }

    const setImage = () => {
        const image = imageUrlRef.current.inputRef.current.value;
        onChange({ ...value, image }, false);
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Shift') {
            setshiftPressed(true);
        }
        if (e.key === 'Backspace' && !input && deletable) {
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
            setImage();
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
        <Image src={value.image} size='small' alt='Image URL broken' />
    );

    const renderSetImage = () => (
        <>
            <b>Insert image from URL</b>
            <br />
            <Input
                ref={imageUrlRef}
                autoFocus
                placeholder='URL'
                onBlur={setImage}
                onKeyDown={handleKeyDown}
                size='small'
                data-cy='image-url-input'
            />
            <Button primary onClick={setImage} size='small' content='Save' />
        </>
    );

    const renderImage = () => (!value.image.trim() ? renderSetImage() : renderViewImage());

    const renderCustom = () => (<Button className='edit-custom-response' onClick={() => editCustom()}>Custom Format Response</Button>);

    const extraClass = isImageResponse && value.image.trim() ? 'image' : '';

    return (
        <div
            className={`utterance-container bot-response ${extraClass}`}
            agent='bot'
            data-cy='bot-response-input'
        >
            <div className='inner'>
                {hasText && !isImageResponse && renderText()}
                {isImageResponse && renderImage()}
                {isQRResponse && renderButtons()}
                {isCustom && renderCustom()}
                {/* hasButtons && value.buttons !== null && renderButtons() */}
            </div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    focus: PropTypes.bool,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    editCustom: PropTypes.func,
};

BotResponseContainer.defaultProps = {
    deletable: true,
    focus: false,
    editCustom: () => {},
};

export default BotResponseContainer;
