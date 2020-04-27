import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup } from 'semantic-ui-react';
import uuidv4 from 'uuid/v4';
import { useDrop } from 'react-dnd-cjs';
import QuickReply, { isButtonValid } from './QuickReply';

function QuickReplies({
    value, onChange, min, max, fluid,
}) {
    const [buttons, setButtons] = useState(value);

    const id = useMemo(() => uuidv4(), [false]);
    const [, drop] = useDrop({ accept: `qr-for-${id}` });

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
    const handleSwapButtons = (index, draggedButtonIndex) => {
        const newButtons = [...buttons];
        newButtons[index] = buttons[draggedButtonIndex];
        newButtons[draggedButtonIndex] = buttons[index];
        setButtons(newButtons);
        onChange(newButtons);
    };

    const quickReplies = buttons.map((b, index) => (
        <QuickReply
            key={b.title + index}
            value={b}
            onChange={butt => handleChange(butt, index)}
            onDelete={() => handleDelete(index)}
            showDelete={buttons.length > min}
            parentId={id}
            buttonIndex={index}
            onReorder={handleSwapButtons}
        />
    ));

    const renderLastButton = () => (
        <>
            {quickReplies[quickReplies.length - 1]}
            {buttons.length < max && buttons.every(b => isButtonValid(b)) && (
                <Popup
                    size='mini'
                    inverted
                    position='top center'
                    content='Add a button'
                    trigger={(
                        <Icon
                            className='add-quick-reply'
                            data-cy='add-quick-reply'
                            name='add'
                            color='grey'
                            onClick={handleAdd}
                        />
                    )}
                />
            )}
        </>
    );

    return (
        <div className={`quick-replies ${fluid ? 'fluid' : ''}`} ref={drop}>
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
