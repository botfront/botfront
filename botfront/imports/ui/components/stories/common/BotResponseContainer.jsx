/* eslint-disable no-underscore-dangle */
import React, {
    useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import TextareaAutosize from 'react-autosize-textarea';
import ImageThumbnail from './ImageThumbnail';
import CarouselEditor from './CarouselEditor';
import QuickReplies from './QuickReplies';

const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, focus, onFocus, editCustom, tag, hasMetadata, metadata, editable, disableEnterKey,
    } = props;

    const [input, setInput] = useState();
    const focusGrabber = useRef();
    const focusHasBeenSet = useRef(false);
    const isCustom = value.__typename === 'CustomPayload';
    const isTextResponse = value.__typename === 'TextPayload';
    const isQRResponse = value.__typename === 'QuickRepliesPayload';
    const isButtonsResponse = value.__typename === 'TextWithButtonsPayload';
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
    }, [value.text]);
    useEffect(() => {
        if (focus && !focusHasBeenSet.current && focusGrabber.current) {
            focusGrabber.current.focus();
            focusHasBeenSet.current = true;
        }
    }, [focus]);

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
        if (key === 'Enter' && isTextResponse && !disableEnterKey) {
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

    const renderQuickReply = () => (
        <QuickReplies
            value={value.quick_replies}
            onChange={(buttons) => {
                onChange({ ...value, quick_replies: buttons }, false);
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

    const getCustomStyle = () => {
        if (metadata
            && metadata.customCss
            && metadata.customCss.style === 'custom'
            && metadata.customCss.css
        ) {
            return { style: { cssText: metadata.customCss.css } };
        }
        return {};
    };

    return (
        <div
            className={`utterance-container ${extraClass} ${metadataClass} ${editable ? '' : 'read-only'}`}
            agent='bot'
            data-cy='bot-response-input'
            {...getCustomStyle()}
        >
            <div className={`${hasMetadata ? 'metadata-response' : ''} ${editable ? '' : 'read-only'}`}>
                {hasText && !isImageResponse && renderText()}
                {isImageResponse && <ImageThumbnail value={value.image} onChange={setImage} />}
                {isCarouselResponse && <CarouselEditor value={value} onChange={onChange} />}
                {isButtonsResponse && renderButtons()}
                {isQRResponse && renderQuickReply()}
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
    metadata: PropTypes.object,
    editable: PropTypes.bool,
    disableEnterKey: PropTypes.bool,
};

BotResponseContainer.defaultProps = {
    focus: false,
    editCustom: () => {},
    tag: null,
    hasMetadata: false,
    metadata: {},
    editable: true,
    disableEnterKey: false,
};

export default BotResponseContainer;
