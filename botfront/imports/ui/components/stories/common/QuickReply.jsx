import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import ResponseButtonEditor from './ResponseButtonEditor';
import { stringPayloadToObject } from '../../../../lib/story_controller';

export const isButtonValid = ({
    title = '',
    type,
    url,
    payload, // eslint-disable-line camelcase
}) => {
    const titleOk = title.length > 0;
    const payloadOk = type === 'postback'
        ? !!stringPayloadToObject(payload).intent
        : !!url;

    return titleOk && payloadOk;
};

function QuickReply({
    value, onChange, onDelete, showDelete,
}) {
    const [buttonValue, setButtonValue] = useState(value);

    const valid = isButtonValid(buttonValue);
    const [isOpen, setIsOpen] = useState(false);
    const button = (
        <button
            type='button'
            className={`quick-reply ${valid ? '' : 'invalid'}`}
            data-cy={(buttonValue.title || 'button_title').replace(/ /g, '_')}
        >
            {buttonValue.title || 'Button title'}
        </button>
    );

    const handleSave = (e) => {
        let origin = e.target; let depth = 0;
        while (origin.className !== 'intent-dropdown' && depth < 8) {
            origin = origin.parentElement || {};
            depth += 1;
        }
        if (origin.className === 'intent-dropdown') return;
        setIsOpen(false);
        // eslint-disable-next-line no-underscore-dangle
        buttonValue.__typename = buttonValue.type === 'postback' ? 'PostbackButton' : 'WebUrlButton';
        onChange(buttonValue);
    };

    return (
        <>
            <Popup
                wide='very'
                trigger={button}
                on='click'
                // hideOnScroll
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={handleSave}
            >
                <ResponseButtonEditor
                    value={buttonValue}
                    onChange={setButtonValue}
                    onDelete={onDelete}
                    onClose={handleSave}
                    showDelete={showDelete}
                    valid={!!valid}
                />
            </Popup>
        </>
    );
}

QuickReply.propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default QuickReply;
