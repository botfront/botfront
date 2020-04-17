import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import ImageThumbnail from './ImageThumbnail';

export default function CarouselSlide(props) {
    const { value, onChange } = props;
    const {
        title: header, subtitle: description, buttons, image_url: image,
    } = value;

    const setValue = update => onChange({ ...value, ...update });
    return (
        <div className='carousel-slide'>
            <ImageThumbnail value={image} onChange={url => onChange({ image_url: url })} />
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
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
};

CarouselSlide.defaultProps = {
};
