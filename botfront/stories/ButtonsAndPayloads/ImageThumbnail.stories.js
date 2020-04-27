import React, { useState, useEffect } from 'react';
import { withKnobs, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import ImageThumbnail from '../../imports/ui/components/stories/common/ImageThumbnail';

const CarouselSlideWrapped = (props) => {
    const { initialImage = '' } = props;
    const [image, setImage] = useState(initialImage);
    useEffect(() => setImage(initialImage), [initialImage]);
    return (
        <ImageThumbnail
            {...props}
            value={image}
            onChange={(...args) => {
                setImage(...args);
                action('onChange')(...args);
            }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/ImageThumbnail',
    component: ImageThumbnail,
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <CarouselSlideWrapped initialImage={select(
        'Initial image URL',
        [
            '',
            'http://botfront.io/image.png',
            'https://www.google.com/logos/doodles/2020/thank-you-teachers-and-childcare-workers-6753651837108762.3-law.gif',
        ],
        '',
    )}
    />
);
export const WithExtraAction = () => (
    <CarouselSlideWrapped
        otherActions={[
            [text('Other action name', 'Do some other thing'), action('otherActionCallback')],
        ]}
    />
);
