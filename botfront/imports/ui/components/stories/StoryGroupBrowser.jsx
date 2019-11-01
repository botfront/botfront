import {
    Menu, Icon, Input, Button, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import StoryGroupItem from './StoryGroupItem';
import { ConversationOptionsContext } from '../utils/Context';

class StoryGroupBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addMode: false,
            newItemName: '',
            editing: -1,
            itemName: '',
        };
    }

    handleChangeNewItemName = (_, data) => {
        this.setState({ newItemName: data.value });
    };

    handleChangeOldName = (_, data) => {
        this.setState({ itemName: data.value });
    };

    handleKeyDownInput = (event, element) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            this.submitTitleInput(element);
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.resetTitleInput();
        }
    };

    resetTitleInput = () => {
        this.resetAddItem();
        this.resetRenameItem();
    }

    submitTitleInput = (element) => {
        const { editing, newItemName, itemName } = this.state;
        const { onAdd, changeName } = this.props;
        if (editing === -1 && !!newItemName) {
            onAdd(newItemName);
            this.resetAddItem();
            return;
        }
        if (editing !== -1 && !!itemName) {
            changeName({ ...element, name: itemName });
            this.setState({ editing: -1 });
            return;
        }
        this.resetRenameItem();
        this.resetAddItem();
    }

    handleClickMenuItem = (index) => {
        const { index: indexProp, onChange } = this.props;
        if (index !== indexProp) {
            onChange(index);
        }
    };

    resetAddItem = () => {
        this.setState({ addMode: false, newItemName: '' });
    };

    resetRenameItem = () => {
        this.setState({ editing: -1 });
    };

    handleToggle = (event, element) => {
        event.stopPropagation();
        const { toggleSelect } = this.props;
        toggleSelect(element);
    };

    tooltipWrapper = (trigger, tooltip) => (
        <Popup
            size='mini'
            inverted
            content={tooltip}
            trigger={trigger}
        />
    )

    render() {
        const {
            children,
            data,
            index: indexProp,
            allowAddition,
            nameAccessor,
            saving,
            selectAccessor,
            allowEdit,
            changeName,
            stories,
            placeholderAddItem,
        } = this.props;
        const {
            addMode, newItemName,
        } = this.state;

        const items = data.map((item, index) => (

            <StoryGroupItem
                key={index.toString()}
                index={index}
                item={item}
                indexProp={indexProp}
                nameAccessor={nameAccessor}
                handleClickMenuItem={() => this.handleClickMenuItem(index)}
                selectAccessor={selectAccessor}
                allowEdit={allowEdit}
                handleToggle={e => this.handleToggle(e, item)}
                saving={saving}
                changeName={changeName}
                stories={stories}
            />
        ));
        return (
            <>
                {allowAddition
                    && (!addMode ? (
                        <Button.Group fluid>
                            {this.tooltipWrapper(
                                <Button
                                    key='newItem'
                                    onClick={() => this.setState({ addMode: true })}
                                    data-cy='add-item'
                                    icon
                                    content={<Icon name='add' />}
                                    style={{ width: 0 }}
                                />,
                                'New story group',
                            )}
                            {this.tooltipWrapper(
                                <Button
                                    onClick={()=>{}}
                                    content='Slots'
                                />,
                                'Manage slots',
                            )}
                            {this.tooltipWrapper(
                                <Button
                                    onClick={()=>{}}
                                    content='Policies'
                                />,
                                'Edit Policies',
                            )}
                        </Button.Group>
                    ) : (
                        <Input
                            placeholder={placeholderAddItem}
                            onChange={this.handleChangeNewItemName}
                            value={newItemName}
                            onKeyDown={this.handleKeyDownInput}
                            autoFocus
                            onBlur={() => this.submitTitleInput()}
                            fluid
                            data-cy='add-item-input'
                        />
                    ))}
                {children}
                {data.length > 0 && (
                    <Menu vertical fluid>
                        {items}
                    </Menu>
                )}
            </>
        );
    }
}

StoryGroupBrowser.propTypes = {
    data: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    index: PropTypes.number,
    allowAddition: PropTypes.bool,
    onAdd: PropTypes.func,
    nameAccessor: PropTypes.string,
    saving: PropTypes.bool,
    selectAccessor: PropTypes.string,
    toggleSelect: PropTypes.func,
    changeName: PropTypes.func,
    allowEdit: PropTypes.bool,
    placeholderAddItem: PropTypes.string,
    children: PropTypes.element,
    stories: PropTypes.array.isRequired,
};

StoryGroupBrowser.defaultProps = {
    onChange: () => {},
    index: 0,
    allowAddition: false,
    onAdd: () => {},
    toggleSelect: () => {},
    changeName: () => {},
    nameAccessor: '_id',
    saving: false,
    selectAccessor: '',
    allowEdit: false,
    placeholderAddItem: '',
    children: <></>,
};


export default props => (
    <ConversationOptionsContext.Consumer>
        {value => (
            <StoryGroupBrowser
                {...props}
                stories={value.stories}
            />
        )}
    </ConversationOptionsContext.Consumer>
);
