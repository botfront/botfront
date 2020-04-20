import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd-cjs';
import CarouselSlide from './CarouselSlide';
import { useEventListener } from '../../utils/hooks';

export default function CarouselEditor(props) {
    const { id, value, onChange } = props;
    const { elements = [] } = value;

    const carouselRef = useRef();
    const [, drop] = useDrop({ accept: `slide-for-${id}` });

    const setSlides = newElements => onChange({ ...value, elements: newElements });
    const setSlideAtIndex = (index, element) => setSlides([
        ...elements.slice(0, index),
        ...(element === null ? [] : [element]),
        ...elements.slice(index + 1),
    ]);
    const createSlide = () => setSlides([...elements, {}]);
    const handleSwapSlides = (index, draggedSlideIndex) => {
        const updatedSlides = [...elements];
        updatedSlides[index] = elements[draggedSlideIndex];
        updatedSlides[draggedSlideIndex] = elements[index];
        setSlides(updatedSlides);
    };

    const handleMouseWheel = (e) => {
        // turns vertical scroll into horizontal scroll
        e.preventDefault();
        carouselRef.current.scrollLeft += 3 * (e.deltaX + e.deltaY);
    };
    useEventListener('wheel', handleMouseWheel, carouselRef.current);

    return (
        <div className='carousel' ref={drop(carouselRef)}>
            {elements.map((slide, i) => (
                <CarouselSlide
                    key={`${i}${slide.title}`}
                    value={slide}
                    parentId={id}
                    slideIndex={i}
                    onChange={v => setSlideAtIndex(i, v)}
                    onReorder={handleSwapSlides}
                />
            ))}
        </div>
    );
}

CarouselEditor.propTypes = {
    id: PropTypes.string,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

CarouselEditor.defaultProps = {
    id: 'default',
};
