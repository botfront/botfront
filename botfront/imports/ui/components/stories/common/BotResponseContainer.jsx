/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Input, Button, Image, Icon, Loader, Dimmer,
} from 'semantic-ui-react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import FloatingIconButton from '../../common/FloatingIconButton';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable, focus, onFocus, editCustom, tag,
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
    const fileField = useRef();
    const [isUploading, setIsUploading] = useState();

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
        if (isQRResponse) { onChange({ text: formatNewlines(input), buttons: value.buttons }, false); }
        if (isImageResponse) { onChange({ text: formatNewlines(input), image: value.image }, false); }
    }

    const setImage = image => onChange({ ...value, image, text: '' }, false);

    const setImageFromUrlBox = () => setImage(imageUrlRef.current.inputRef.current.value);

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
        <Image src={value.image} size='small' alt='Image URL broken' />
    );

    const renderUploading = () => (
        <div style={{ minHeight: '50px' }}>
            <Dimmer active inverted>
                <Loader inverted size='small'>
                    <span className='small grey'>Uploading</span>
                </Loader>
            </Dimmer>
        </div>
    );

    const handleFileDrop = (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!validFiles.length) return alert('Not an image');
        setIsUploading(true);
        setTimeout(() => {
            setImage('https://icon2.cleanpng.com/20180331/vlq/kisspng-unicorn-paper-party-printing-mythology-unicornio-5abf95f9cd7b97.4029263615225052098417.jpg');
            setIsUploading(false);
        }, 1500);
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: item => handleFileDrop(item.files),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const renderSetImage = () => (
        <div
            ref={drop}
            {...(canDrop && isOver ? { className: 'upload-target' } : {})}
        >
            <div className='align-center'>
                <Icon name='image' size='huge' color='grey' />
                <input
                    type='file'
                    ref={fileField}
                    style={{ display: 'none' }}
                    onChange={e => handleFileDrop(e.target.files)}
                />
                <Button
                    primary
                    basic
                    content='Upload image'
                    size='small'
                    onClick={() => fileField.current.click()}
                />
                <span className='small grey'>or drop an image file to upload</span>
            </div>
            <div className='or'> or </div>
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
        </div>
    );

    const renderImage = () => (isUploading
        ? renderUploading()
        : !value.image.trim()
            ? renderSetImage()
            : renderViewImage());

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
    tag: PropTypes.string,
};

BotResponseContainer.defaultProps = {
    deletable: true,
    focus: false,
    editCustom: () => {},
    tag: null,
};

export default BotResponseContainer;
