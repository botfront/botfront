import React, {
    useRef, useState, useEffect, useContext,
} from 'react';
import PropTypes from 'prop-types';
import {
    Image, Input, Button, Modal, Icon, Dimmer, Loader,
} from 'semantic-ui-react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import { ResponseContext } from './BotResponsesContainer';
import { ProjectContext } from '../../../layouts/context';
import { wrapMeteorCallback } from '../../utils/Errors';

export default function ImageThumbnail(props) {
    const {
        value, editable, onChange, otherActions, className,
    } = props;
    const [newValue, setNewValue] = useState(value);
    const [modalOpen, setModalOpen] = useState(false);
    const { uploadImage } = useContext(ResponseContext) || {};
    const { project: { _id: projectId } } = useContext(ProjectContext);
    useEffect(() => setNewValue(value), [value]);

    const imageUrlRef = useRef();
    const fileField = useRef();
    const [isUploading, setIsUploading] = useState();

    const handleSrcChange = (src) => {
        onChange(src);
        Meteor.call('delete.image', projectId, value, wrapMeteorCallback);
    };

    const setImageFromUrlBox = () => {
        handleSrcChange(imageUrlRef.current.inputRef.current.value);
        setModalOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setImageFromUrlBox();
        }
    };

    const handleFileDrop = async (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (validFiles.length !== 1) return; // reject sets, and non-images
        setIsUploading(true);
        setModalOpen(false);
        uploadImage({
            file: validFiles[0], setImage: handleSrcChange, resetUploadStatus: () => setIsUploading(false),
        });
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: item => handleFileDrop(item.files),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const actions = [
        ['Set image', () => setModalOpen(true), 'set-image'],
        ...otherActions,
    ];

    const renderSetImage = () => (
        <div className={`image-modal ${canDrop && isOver ? 'upload-target' : ''}`} ref={drop}>
            {uploadImage && (
            <>
                <div className='align-center'>
                    <Icon name='image' size='huge' color='grey' />
                    <input
                        type='file'
                        ref={fileField}
                        style={{ display: 'none' }}
                        onChange={e => handleFileDrop(e.target.files)}
                    />
                    <Button
                        primary
                        basic
                        content='Upload image'
                        size='small'
                        onClick={() => fileField.current.click()}
                    />
                    <span className='small grey'>or drop an image file to upload</span>
                </div>
                <div className='or'> or </div>
            </>
            )}
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
            {!isUploading
                ? (
                    <>
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
                        <Image src={value || ''} size='small' alt=' ' />
                    </>
                )
                : (
                    <Dimmer active inverted>
                        <Loader inverted size='small'>
                            <span className='small grey'>Uploading</span>
                        </Loader>
                    </Dimmer>
                )
            }
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
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    editable: PropTypes.bool,
    otherActions: PropTypes.array,
    className: PropTypes.string,
};

ImageThumbnail.defaultProps = {
    otherActions: [],
    editable: true,
    value: '',
    className: '',
};
