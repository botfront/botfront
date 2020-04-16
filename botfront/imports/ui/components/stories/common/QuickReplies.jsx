import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import QuickReply, { isButtonValid } from './QuickReply';

function QuickReplies({
    value, onChange, min, max, fluid,
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

    const renderLastButton = () => (
        <>
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
        </>
    );

    return (
        <div className={`quick-replies ${fluid ? 'fluid' : ''}`}>
            {quickReplies.slice(0, quickReplies.length - 1)}
            {fluid
                ? renderLastButton()
                : <div className='last-button'>{renderLastButton()}</div>
            }
        </div>
    );
}

QuickReplies.propTypes = {
    value: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    fluid: PropTypes.bool,
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
    fluid: false,
};

export default QuickReplies;
