import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Image, Input, Button, Modal,
} from 'semantic-ui-react';

export default function ImageThumbnail(props) {
    const {
        value, editable, onChange, otherActions, className,
    } = props;
    const [newValue, setNewValue] = useState(value);
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => setNewValue(value), [value]);

    const imageUrlRef = useRef();

    const setImageFromUrlBox = () => {
        onChange(imageUrlRef.current.inputRef.current.value);
        setModalOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setImageFromUrlBox();
        }
    };

    const actions = [
        ['Set image', () => setModalOpen(true), 'set-image'],
        ...otherActions,
    ];

    const renderSetImage = () => (
        <div className='image-modal'>
            <b>Insert image from URL</b>
            <br />
            <div className='side-by-side middle'>
                <Input
                    ref={imageUrlRef}
                    autoFocus
                    value={newValue}
                    onChange={(_, { value: v }) => setNewValue(v)}
                    placeholder='URL'
                    onKeyDown={handleKeyDown}
                    size='small'
                    data-cy='image-url-input'
                    className='image-url-input'
                />
                <Button primary onClick={setImageFromUrlBox} size='small' content='Save' />
            </div>
        </div>
    );

    return (
        <div data-cy='image-container' className={`image-container ${value.trim() ? 'image-set' : ''} ${className}`}>
            <div className={`overlay-menu ${!editable ? 'uneditable' : ''}`}>
                <div>
                    {editable && (
                        <Button.Group vertical>
                            {actions.map(([title, func, dataCy, buttonClass]) => (
                                <Button basic key={title} onClick={func} content={title} data-cy={dataCy} className={buttonClass} />
                            ))}
                        </Button.Group>
                    )}
                </div>
            </div>
            <Image src={value || ''} size='small' alt='' />
            {modalOpen && (
                <Modal
                    open
                    size='tiny'
                    onClose={setImageFromUrlBox}
                    content={renderSetImage()}
                />
            )}
        </div>
    );
}

ImageThumbnail.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    editable: PropTypes.bool,
    otherActions: PropTypes.array,
    className: PropTypes.string,
};

ImageThumbnail.defaultProps = {
    onChange: () => {},
    otherActions: [],
    editable: true,
    value: '',
    className: '',
};
