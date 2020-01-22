import React from 'react';
import PropTypes from 'prop-types';

import StoryGroupItem from './StoryGroupItem';

const SmartStoryGroup = (props) => {
    const {
        activeIndex,
        index,
        handleClickMenuItem,
    } = props;
    return (
        <StoryGroupItem
            key='smart-story-group'
            index={index}
            item={{
                name: 'Smart stories',
            }}
            indexProp={activeIndex}
            nameAccessor='name'
            handleClickMenuItem={() => handleClickMenuItem(index)}
            allowEdit={false}
            handleToggle={() => {}}
            saving={false}
            changeName={() => {}}
            stories={[]}
            selectAccessor={null}
        />
    );
};

SmartStoryGroup.propTypes = {
    activeIndex: PropTypes.number,
    index: PropTypes.number.isRequired,
    handleClickMenuItem: PropTypes.func.isRequired,
};

SmartStoryGroup.defaultProps = {
    activeIndex: -1,
};

export default SmartStoryGroup;
