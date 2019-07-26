import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import './QuickReply.import.less';
import QuickReply from './QuickReply';
import { stringPayloadToObject } from '../../../../lib/story_validation';

export const isButtonValid = ({ title, type, payload }) => {
    const titleOk = title.length > 0;
    const payloadOk = type === 'postback'
        ? stringPayloadToObject(payload).intent.length > 0
        : payload.match(/^https?:\/\//);
        
    return titleOk && payloadOk;
};

function QuickReplies({
    value, onChange, min, max,
}) {
    const [buttons, setButtons] = useState(value);
    const propagate = () => {
        if (buttons.every(isButtonValid)) onChange(buttons);
    };

    const handleChange = (button, i) => {
        setButtons([...buttons.slice(0, i), button, ...buttons.slice(i + 1)]);
        propagate();
    };

    const handleAdd = () => {
        setButtons([
            ...buttons,
            {
                title: '',
                type: 'postback',
                payload: '',
            },
        ]);
        propagate();
    };

    const handleDelete = (index) => {
        setButtons([...buttons.slice(0, index), ...buttons.slice(index + 1)]);
        propagate();
    };

    const quickReplies = buttons.map((b, index) => (
        <QuickReply
            value={b}
            onChange={butt => handleChange(butt, index)}
            onDelete={() => handleDelete(index)}
            showDelete={buttons.length > min}
            valid={isButtonValid(b)}

        />
    ));

    return (
        <>
            {quickReplies}
            {buttons.length < max && buttons.every(b => isButtonValid(b)) && (
                <Icon
                    className='add-quick-reply'
                    name='add'
                    color='grey'
                    onClick={handleAdd}
                />
            )}
        </>
    );
}

QuickReplies.propTypes = {
    value: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['postback', 'url']),
            payload: PropTypes.string.isRequired,
        }),
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
};

QuickReplies.defaultProps = {
    min: 1,
    max: 99,
};

export default QuickReplies;
