import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Modal } from 'semantic-ui-react';
import CarouselSlide from './CarouselSlide';

export default function CarouselEditor(props) {
    const { value, onChange } = props;
    const { elements = [] } = value;

    const setCards = newElements => onChange({ ...value, elements: newElements });
    const setCardAtIndex = (index, element) => setCards([
        ...elements.slice(0, index),
        ...(element === null ? [] : [element]),
        ...elements.slice(index + 1),
    ]);
    const createCard = () => setCards([...elements, {}]);
    const handleSwapCards = (index, draggedCardIndex) => {
        const updatedCards = [...elements];
        updatedCards[index] = elements[draggedCardIndex];
        updatedCards[draggedCardIndex] = elements[index];
        setCards(updatedCards);
    };

    return (
        <div className='carousel'>
            {elements.map((card, i) => <CarouselSlide key={`${i}${card.title}`} value={card} onChange={v => setCardAtIndex(i, v)} />)}
        </div>
    );
}

CarouselEditor.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
};

CarouselEditor.defaultProps = {
};
