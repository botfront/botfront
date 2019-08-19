import React, { useState } from 'react';
import { Menu } from 'semantic-ui-react';

import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import BranchTabLabel from '../imports/ui/components/stories/BranchTabLabel.jsx';

const MenuContentsWrapper = () => {
    // eslint-disable-next-line no-unused-vars
    const [activeItem, setActiveItem] = useState('hi');
    const [tabValues, setTabValue] = useState(['hi', 'this is a longer variable name', 'test branch']);
    const onDelete = () => {
        // eslint-disable-next-line no-console
        console.log('deleted');
    };

    const handleOnChange = (value) => {
        const newTabValues = tabValues;
        newTabValues[tabValues.indexOf(activeItem)] = value;
        setTabValue(newTabValues);
    };

    const handleOnClick = (value) => {
        setActiveItem(value);
    };
    return (
        <>
            <BranchTabLabel
                active={activeItem}
                onDelete={onDelete}
                onChangeName={handleOnChange}
                onSelect={setActiveItem}
                value={tabValues[0]}
                hasWarning={boolean('hasWarning', false)}
                hasError={boolean('hasError', false)}
            />
            <BranchTabLabel
                active={activeItem}
                onDelete={onDelete}
                onChangeName={handleOnChange}
                onSelect={handleOnClick}
                value={tabValues[1]}
                hasWarning={boolean('hasWarning', false)}
                hasError={boolean('hasError', false)}
            />
            <BranchTabLabel
                active={activeItem}
                onDelete={onDelete}
                onChangeName={handleOnChange}
                onSelect={handleOnClick}
                value={tabValues[2]}
                hasWarning={boolean('hasWarning', false)}
                hasError={boolean('hasError', false)}
            />
        </>
    );
};

storiesOf('BranchTabLabel', module)
    .addDecorator(withKnobs)
    .add('testcase2', () => (
        <Menu tabular size='mini'>
            <MenuContentsWrapper />
        </Menu>
    ));
