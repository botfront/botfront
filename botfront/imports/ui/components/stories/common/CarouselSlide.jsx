import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Modal } from 'semantic-ui-react';
import { useDrag, useDrop } from 'react-dnd-cjs';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import ImageThumbnail from './ImageThumbnail';
import ResponseButtonEditor from './ResponseButtonEditor';

export default function CarouselSlide(props) {
    const {
        parentId, slideIndex, onReorder, value, onChange,
    } = props;
    const {
        title: header, subtitle: description, buttons = [], image_url: image, default_action: defaultAction,
    } = value;
    const [modalOpen, setModalOpen] = useState(false);

    const setValue = update => onChange({ ...value, ...update });

    const [, drag] = useDrag({
        item: { type: `slide-for-${parentId}`, slideIndex },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: `slide-for-${parentId}`,
        drop: ({ slideIndex: draggedSlideIndex }) => {
            if (draggedSlideIndex !== slideIndex) onReorder(slideIndex, draggedSlideIndex);
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const renderDefaultActionModal = () => (
        <div className='image-modal'>
            <ResponseButtonEditor
                noButtonTitle
                value={defaultAction}
                onChange={v => setValue({ default_action: v })}
                onClose={() => setModalOpen(false)}
                valid
            />
        </div>
    );
    return (
        <div
            className={`carousel-slide ${canDrop ? (isOver ? 'upload-target' : 'faded-upload-target') : ''}`}
            ref={node => drag(drop(node))}
        >
            <ImageThumbnail
                value={image}
                onChange={url => onChange({ image_url: url })}
                otherActions={[['Set default action', () => setModalOpen(true)]]}
            />
            {modalOpen && (
                <Modal
                    open
                    size='tiny'
                    header='Change default action'
                    onClose={() => setModalOpen(false)}
                    content={renderDefaultActionModal()}
                />
            )}
            <Header as='h3'>
                <TextareaAutosize
                    placeholder='Title'
                    value={header}
                    onChange={event => setValue({ title: event.target.value })}
                />
                <Header.Subheader>
                    <TextareaAutosize
                        placeholder='Description'
                        value={description}
                        onChange={event => setValue({ subtitle: event.target.value })}
                    />
                </Header.Subheader>
            </Header>
            <QuickReplies
                {...props}
                min={0}
                max={3}
                fluid
                value={buttons}
                onChange={v => setValue({ buttons: v })}
            />
        </div>
    );
}

CarouselSlide.propTypes = {
    parentId: PropTypes.string,
    slideIndex: PropTypes.number,
    onReorder: PropTypes.func,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

CarouselSlide.defaultProps = {
    parentId: 'default',
    slideIndex: 0,
    onReorder: () => {},
};
