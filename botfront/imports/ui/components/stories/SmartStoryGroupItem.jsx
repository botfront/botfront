import React from 'react';
import PropTypes from 'prop-types';

import StoryGroupItem from './StoryGroupItem';

const SmartStoryGroupItem = (props) => {
    const {
        activeIndex,
        index,
        handleClickMenuItem,
        item,
    } = props;
    return (
        <StoryGroupItem
            key={`smart-browser-item-${index}`}
            index={index}
            item={item}
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

SmartStoryGroupItem.propTypes = {
    activeIndex: PropTypes.number,
    index: PropTypes.number.isRequired,
    handleClickMenuItem: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
};

SmartStoryGroupItem.defaultProps = {
    activeIndex: -1,
};

export default SmartStoryGroupItem;
