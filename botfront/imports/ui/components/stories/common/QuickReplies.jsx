import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import './QuickReply.import.less';
import QuickReply, { isButtonValid } from './QuickReply';

function QuickReplies({
    value, onChange, min, max,
}) {
    const [buttons, setButtons] = useState(value);

    const handleChange = (button, i) => {
        const newButtons = [...buttons.slice(0, i), button, ...buttons.slice(i + 1)];
        setButtons(newButtons);
        if (newButtons.every(isButtonValid)) onChange(newButtons);
    };

    const handleAdd = () => {
        const newButtons = [
            ...buttons,
            {
                title: '',
                type: 'postback',
                payload: '',
            },
        ];
        setButtons(newButtons);
        if (newButtons.every(isButtonValid)) onChange(newButtons);
    };

    const handleDelete = (index) => {
        const newButtons = [...buttons.slice(0, index), ...buttons.slice(index + 1)];
        setButtons(newButtons);
        if (newButtons.every(isButtonValid)) onChange(newButtons);
    };

    const quickReplies = buttons.map((b, index) => (
        <QuickReply
            key={b.title + index}
            value={b}
            onChange={butt => handleChange(butt, index)}
            onDelete={() => handleDelete(index)}
            showDelete={buttons.length > min}
        />
    ));

    return (
        <div className='quick-replies'>
            {quickReplies.slice(0, quickReplies.length - 1)}
            <div className='last-button'>
                {quickReplies[quickReplies.length - 1]}
                {buttons.length < max && buttons.every(b => isButtonValid(b)) && (
                    <Icon
                        className='add-quick-reply'
                        data-cy='add-quick-reply'
                        name='add'
                        color='grey'
                        onClick={handleAdd}
                    />
                )}
            </div>
        </div>
    );
}

QuickReplies.propTypes = {
    value: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
};

QuickReplies.defaultProps = {
    min: 1,
    max: 99,
    value: [
        {
            title: '',
            type: 'postback',
            payload: '',
        },
    ],
};

export default QuickReplies;
