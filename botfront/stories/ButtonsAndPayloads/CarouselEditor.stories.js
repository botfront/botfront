import React, { useState } from 'react';
import { withKnobs, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import CarouselEditor from '../../imports/ui/components/stories/common/CarouselEditor';

const initialValue = {
    elements: [
        {
            title: 'Strawberry',
            subtitle: 'Classic. Also not a _berry_ berry.',
            image_url: 'https://image.shutterstock.com/image-vector/strawberry-isolated-on-white-background-260nw-1217763694.jpg',
        },
        {
            title: 'Mulberry',
            subtitle: 'Leaves eaten by silk worms.',
            image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRxfonrZq1gxu7V9JJ7XlETWvpn5EHF-eNF-k-nAiT5AqMOcHtj&usqp=CAU',
        },
        {
            title: 'Bilberry',
            subtitle: 'Only fruit found in Iceland.',
            image_url: 'https://thumbs.dreamstime.com/b/blueberry-branches-bush-vector-33127150.jpg',
        },
        {
            title: 'Chokeberry',
            image_url: 'https://cdn.imgbin.com/25/17/10/imgbin-chokeberry-blueberry-rEzsJXhWazQu6v6VyvRBcbqqv.jpg',
        },
        {
            title: 'Cloudberry',
            image_url: 'https://p1.hiclipart.com/preview/207/998/426/pomegranate-flower-cloudberry-nectar-berries-juice-cranberry-syrup-food-png-clipart.jpg',
        },
    ],
};


const CarouselEditorWrapped = (props) => {
    const { value } = props;
    const [carousel, setCarousel] = useState(value || {});
    return (
        <div
            style={{
                border: '3px #ddd solid',
                borderRadius: '4px',
                padding: '5px',
                maxWidth: '100%',
                width: `${number('Container width (px)', 850)}px`,
            }}
        >
            <CarouselEditor
                {...props}
                value={carousel}
                onChange={(...args) => { setCarousel(...args); action('onChange')(...args); }}
            />
        </div>
    );
};

export default {
    title: 'ButtonsAndPayloads/CarouselEditor',
    component: CarouselEditor,
    decorators: [withKnobs, withBackground],
};

export const Blank = () => <CarouselEditorWrapped value={initialValue} />;
