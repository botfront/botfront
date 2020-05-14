import React, { useState } from 'react';
import { Menu, Segment } from 'semantic-ui-react';

import { withKnobs, boolean } from '@storybook/addon-knobs';
import BranchTabLabel from '../../imports/ui/components/stories/BranchTabLabel.jsx';

const MenuContentsWrapper = ({ hasWarning, hasError }) => {
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
                    key={tabValues[i]}
                    active={tabValues[i] === activeItem}
                    onDelete={onDelete}
                    onChangeName={handleOnChange}
                    onSelect={handleOnClick}
                    value={tabValues[i]}
                    hasWarning={hasWarning}
                    hasError={hasError}
                />
            );
            tabList.push(tab);
        }
        return tabList;
    };

    return (renderTabs(7)
    );
};

export default {
    title: '_broken/BranchTabLabel',
    component: BranchTabLabel,
    decorators: [withKnobs],
};

export const Basic = () => (
    <div style={{
        width: '90%',
        margin: '10px auto',
        outline: '4px solid red',
    }}
    >
        <div className='stories-container'>
            <div className='story-editor'>
                <Menu attached='top'>
                    <Menu.Item>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Menu.Item>
                </Menu>
                <Segment attached>
                        (Content)
                    <br />
                    <Menu pointing secondary size='mini'>
                        <MenuContentsWrapper
                            hasWarning={boolean('hasWarning', false)}
                            hasError={boolean('hasError', false)}
                        />
                    </Menu>
                    <br />
                        (Content)
                </Segment>
            </div>
        </div>
    </div>
);
