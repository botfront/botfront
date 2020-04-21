import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Header, Modal, Icon } from 'semantic-ui-react';
import { useDrag, useDrop } from 'react-dnd-cjs';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import ImageThumbnail from './ImageThumbnail';
import ResponseButtonEditor from './ResponseButtonEditor';

export default function CarouselSlide(props) {
    const {
        parentId, slideIndex, onDelete, onReorder, value, onChange,
    } = props;
    const {
        buttons = [], image_url: image = '', default_action: defaultAction = {},
    } = value;
    
    const [newValue, doSetNewValue] = useState(value);
    useEffect(() => doSetNewValue(value), [value]);
    const setNewValue = (update = {}) => doSetNewValue({ ...newValue, ...update });
    const [modalOpen, setModalOpen] = useState(false);

    const setValue = (update = {}) => onChange({ ...newValue, ...update });

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
                otherActions={[
                    ['Set default action', () => setModalOpen(true), 'set-default-action'],
                    ...(onDelete ? [[<Icon name='trash' />, onDelete, 'delete-slide']] : []),
                ]}
                className={defaultAction.web_url || defaultAction.payload ? 'highlight' : ''}
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
                    value={newValue.title}
                    onChange={event => setNewValue({ title: event.target.value })}
                    onBlur={() => setValue()}
                />
                <Header.Subheader>
                    <TextareaAutosize
                        placeholder='Description'
                        value={newValue.subtitle}
                        onChange={event => setNewValue({ subtitle: event.target.value })}
                        onBlur={() => setValue()}
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
    onDelete: PropTypes.func,
    onReorder: PropTypes.func,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

CarouselSlide.defaultProps = {
    parentId: 'default',
    slideIndex: 0,
    onDelete: null,
    onReorder: () => {},
};
