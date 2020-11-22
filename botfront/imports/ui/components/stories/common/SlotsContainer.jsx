import React from 'react';
import PropTypes from 'prop-types';

import SlotLabel from '../SlotLabel';
import SlotPopupContent from './SlotPopupContent';
import IconButton from '../../common/IconButton';

export const ResponseContext = React.createContext();

const SlotsContainer = (props) => {
    const {
        value,
        onChange,
        onDelete,
        deletable,
        className,
    } = props;

    const handleReplaceLine = (index, content) => {
        onChange([...value.slice(0, index), content, ...value.slice(index + 1)]);
    };

    const handleDeleteLine = (index) => {
        onChange([...value.slice(0, index), ...value.slice(index + 1)]);
    };

    const handleInsertLine = (index, content) => {
        onChange([...value.slice(0, index + 1), content, ...value.slice(index + 1)]);
    };

    return (
        <div className='utterances-container exception-wrapper-target'>
            {value.map((slot, i) => (
                <div className={`story-line ${className}`} key={i}>
                    <SlotLabel
                        value={slot}
                        onChange={({ name, slotValue }) => handleReplaceLine(i, { [name]: slotValue })}
                    />
                    {i === value.length - 1 && (
                        <SlotPopupContent
                            trigger={<IconButton icon='add' />}
                            onSelect={({ name, slotValue }) => handleInsertLine(i, { [name]: slotValue })}
                        />
                    )}
                    {deletable && value.length > 1 && <IconButton onClick={() => handleDeleteLine(i)} icon='trash' />}
                </div>
            ))}
            <div className='side-by-side right narrow top-right'>
                {deletable && onDelete && <IconButton onClick={onDelete} icon='trash' />}
            </div>
        </div>
    );
};

SlotsContainer.propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    deletable: PropTypes.bool,
    className: PropTypes.string,
};

SlotsContainer.defaultProps = {
    deletable: true,
    className: '',
};

export default SlotsContainer;
