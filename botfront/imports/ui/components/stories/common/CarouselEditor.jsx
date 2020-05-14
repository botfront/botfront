import React, { useRef, useMemo } from 'react';
import uuidv4 from 'uuid/v4';
import PropTypes from 'prop-types';
import { Icon, Popup } from 'semantic-ui-react';
import { useDrop } from 'react-dnd-cjs';
import CarouselSlide from './CarouselSlide';
import { useEventListener } from '../../utils/hooks';
import { defaultCarouselSlide } from '../../../../lib/botResponse.utils';

export default function CarouselEditor(props) {
    const {
        min, max, value, onChange,
    } = props;
    const { elements = [] } = value;

    const carouselRef = useRef();
    const id = useMemo(() => uuidv4(), [false]);
    const [, drop] = useDrop({ accept: `slide-for-${id}` });

    const setSlides = newElements => onChange({ ...value, elements: newElements });
    const setSlideAtIndex = (index, element) => setSlides([
        ...elements.slice(0, index),
        ...(element === null ? [] : [element]),
        ...elements.slice(index + 1),
    ]);
    const createSlide = () => setSlides([...elements, defaultCarouselSlide()]);
    const handleSwapSlides = (index, draggedSlideIndex) => {
        const updatedSlides = [...elements];
        updatedSlides[index] = elements[draggedSlideIndex];
        updatedSlides[draggedSlideIndex] = elements[index];
        setSlides(updatedSlides);
    };

    const handleMouseWheel = (e) => {
        // turns vertical scroll into horizontal scroll
        if (carouselRef.current.contains(e.target)) {
            if (e.deltaY < 0 && carouselRef.current.scrollLeft === 0) return;
            if (e.deltaY > 0 && carouselRef.current.scrollLeft === carouselRef.current.scrollLeftMax) return;
            e.preventDefault();
            carouselRef.current.scrollLeft += 3 * (e.deltaX + e.deltaY);
        }
    };
    useEventListener('wheel', handleMouseWheel, carouselRef.current);

    return (
        <div className='carousel' ref={drop(carouselRef)}>
            {elements.map((slide, i) => (
                <CarouselSlide
                    key={`${i}${JSON.stringify(slide)}`}
                    value={slide}
                    parentId={id}
                    slideIndex={i}
                    onChange={v => setSlideAtIndex(i, v)}
                    onReorder={handleSwapSlides}
                    onDelete={elements.length > min ? () => setSlideAtIndex(i, null) : null}
                />
            ))}
            {elements.length < max && (
                <div className='carousel-slide blank'>
                    <Popup
                        size='mini'
                        inverted
                        content='Add a slide'
                        trigger={(
                            <Icon name='add' size='huge' color='grey' link onClick={createSlide} data-cy='add-slide' />
                        )}
                    />
                </div>
            )}
        </div>
    );
}

CarouselEditor.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

CarouselEditor.defaultProps = {
    min: 1,
    max: 10,
};
