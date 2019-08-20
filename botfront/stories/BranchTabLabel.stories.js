import React, { useState } from 'react';
import { Menu } from 'semantic-ui-react';

import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import BranchTabLabel from '../imports/ui/components/stories/BranchTabLabel.jsx';

const MenuContentsWrapper = () => {
    // eslint-disable-next-line no-unused-vars
    const [activeItem, setActiveItem] = useState('hi');
    const [tabValues, setTabValue] = useState(['hi', 'this is a longer variable name', 'test branch', 'new test', 'mybranch6', 'other branch', 'add more branch names to go further']);
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

    const renderTabs = (nTabs) => {
        // this will only add up to a max of seven branches add more branch names in const [tabValue, setTabValue]
        const tabList = [];
        for (let i = 0; i < nTabs; i += 1) {
            const tab = (
                <BranchTabLabel
                    active={activeItem}
                    onDelete={onDelete}
                    onChangeName={handleOnChange}
                    onSelect={handleOnClick}
                    value={tabValues[i]}
                    hasWarning={boolean('hasWarning', false)}
                    hasError={boolean('hasError', false)}
                />
            );
            tabList.push(tab);
        }
        return tabList;
    };

    return (renderTabs(7)
    );
};

storiesOf('BranchTabLabel', module)
    .addDecorator(withKnobs)
    .add('testcase2', () => (
        <Menu tabular size='mini'>
            <MenuContentsWrapper />
        </Menu>
    ));
