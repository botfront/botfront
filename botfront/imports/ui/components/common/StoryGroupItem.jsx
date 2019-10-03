import React, { useState } from 'react';
import {
    Menu, Icon, Input, Loader, Confirm,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import EllipsisMenu from './EllipsisMenu';


function StoryGroupItem(props) {
    const {
        index,
        item,
        indexProp,
        nameAccessor,
        handleClickMenuItem,
        selectAccessor,
        allowEdit,
        handleToggle,
        saving,
        stories,
        changeName,
    } = props;

    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [storyName, setStoryName] = useState(item[nameAccessor]);

    function resetNameEdit() {
        setEditing(false);
    }

    function submitNameChange() {
        changeName({ ...item, name: storyName });
        resetNameEdit();
    }

    function handleKeyDownInput(event, element) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            submitNameChange(element);
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            resetNameEdit();
        }
    }

    function handleNameChange(_, data) {
        setStoryName(data.value);
    }

    
    function removeStoryGroup() {
        Meteor.call('storyGroups.delete', item);
        setDeletionModalVisible(false);
    }

    return (
        <Menu.Item
            name={item[nameAccessor]}
            className={indexProp === index ? 'selected-blue' : ''}
            active={indexProp === index}
            onClick={() => handleClickMenuItem(index)}
            link={indexProp !== index}
            data-cy='browser-item'
        >
            {!editing ? (
            <>
                {selectAccessor && (
                    <Icon
                        id={`${
                            item[selectAccessor]
                                ? 'selected'
                                : 'not-selected'
                        }`}
                        name='eye'
                        onClick={e => handleToggle(e, item)}
                    />
                )}
                {allowEdit && (
                    <EllipsisMenu
                        handleEdit={() => setEditing(true)}
                        handleDelete={() => setDeletionModalVisible(true)}
                    />
                )}
                <span className='story-group-menu-item'>{item[nameAccessor]}</span>
                {indexProp === index && saving && (
                    <Loader active size='tiny' />
                )}
            </>
            ) : (
                <Input
                    onChange={handleNameChange}
                    value={storyName}
                    onKeyDown={handleKeyDownInput}
                    autoFocus
                    onBlur={submitNameChange}
                    fluid
                    data-cy='edit-name'
                />
            )}
            <Confirm
                open={deletionModalVisible}
                className='warning'
                header='Warning!'
                confirmButton='Delete'
                content={`The story group ${item[nameAccessor]} and all its stories in it will be deleted. This action cannot be undone.`}
                onCancel={() => setDeletionModalVisible(false)}
                onConfirm={removeStoryGroup}
            />
        </Menu.Item>);
}


StoryGroupItem.propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired,
    indexProp: PropTypes.number.isRequired,
    nameAccessor: PropTypes.string,
    handleClickMenuItem: PropTypes.func.isRequired,
    selectAccessor: PropTypes.string,
    allowEdit: PropTypes.bool,
    handleToggle: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    stories: PropTypes.array.isRequired,
    changeName: PropTypes.func.isRequired,
};

StoryGroupItem.defaultProps = {
    nameAccessor: 'name',
    selectAccessor: 'selected',
    allowEdit: true,
};

export default StoryGroupItem;
