import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './QuickReply.import.less';
import { Popup } from 'semantic-ui-react';
import ResponseButtonEditor from './ResponseButtonEditor';
import { stringPayloadToObject } from '../../../../lib/story_controller';

export const isButtonValid = ({
    title,
    type,
    payload, // eslint-disable-line camelcase
}) => {
    const titleOk = title.length > 0;
    const payloadOk = type === 'postback'
        ? stringPayloadToObject(payload).intent.length > 0
        : payload && payload.length;

    return titleOk && payloadOk;
};

function QuickReply({
    value, onChange, onDelete, showDelete,
}) {
    const [buttonValue, setButtonValue] = useState(value);

    const valid = isButtonValid(buttonValue);
    const [isOpen, setIsOpen] = useState(false);
    const button = (
        <button type='button' className={`quick-reply ${valid ? '' : 'invalid'}`}>
            {buttonValue.title || 'Button title'}
        </button>
    );

    const handleSave = () => {
        setIsOpen(false);
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
                    valid={valid}
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
