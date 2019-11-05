import {
    Menu, Icon, Input, Button, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { Slots } from '../../../api/slots/slots.collection';
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
    };

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
    };

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
        <Popup size='mini' inverted content={tooltip} trigger={trigger} />
    );

    getItems = (slice) => {
        const {
            data,
            index: indexProp,
            nameAccessor,
            selectAccessor,
            allowEdit,
            saving,
            changeName,
            stories,
        } = this.props;
        return data.slice(...slice)
            .map((item, index) => (
                <StoryGroupItem
                    key={index + slice[0]}
                    index={index + slice[0]}
                    item={item}
                    indexProp={indexProp}
                    nameAccessor={nameAccessor}
                    handleClickMenuItem={() => this.handleClickMenuItem(index + slice[0])}
                    selectAccessor={selectAccessor}
                    allowEdit={allowEdit}
                    handleToggle={e => this.handleToggle(e, item)}
                    saving={saving}
                    changeName={changeName}
                    stories={stories}
                />
            ));
    };

    renderNavigation = () => {
        const { modals, storyMode, onSwitchStoryMode } = this.props;
        return (
            <div className='navigation'>
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
                            className='border-left'
                            content='Slots'
                            onClick={() => modals.setSlotsModal(true)}
                            data-cy='slots-modal'
                        />,
                        'Manage slots',
                    )}
                    {this.tooltipWrapper(
                        <Button
                            className='border-left'
                            content='Policies'
                            onClick={() => modals.setPoliciesModal(true)}
                            data-cy='policies-modal'
                        />,
                        'Edit Policies',
                    )}
                </Button.Group>
                {this.tooltipWrapper(
                    <Button
                        data-cy={storyMode === 'visual' ? 'toggle-md' : 'toggle-visual'}
                        icon
                        style={{ width: '36px' }}
                        floated='right'
                        onClick={() => onSwitchStoryMode(storyMode === 'visual' ? 'markdown' : 'visual')}
                    >
                        <Icon name={storyMode === 'visual' ? 'code' : 'commenting'} />
                    </Button>,
                    storyMode === 'visual' ? 'Switch to Markdown edit mode' : 'Switch to visual edit mode',
                )}
            </div>
        );
    };

    render() {
        const {
            data,
            allowAddition,
            placeholderAddItem,
        } = this.props;
        const { addMode, newItemName } = this.state;

        return (
            <div className='storygroup-browser'>
                {allowAddition
                    && (!addMode
                        ? this.renderNavigation()
                        : (
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
                {data.length && (
                    <Menu vertical fluid>
                        {this.getItems([0, 1])}
                    </Menu>
                )}
                {data.length > 1 && (
                    <Menu vertical fluid>
                        {this.getItems([1])}
                    </Menu>
                )}
            </div>
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
    stories: PropTypes.array.isRequired,
    modals: PropTypes.object.isRequired,
    onSwitchStoryMode: PropTypes.func.isRequired,
    storyMode: PropTypes.string.isRequired,
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
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const BrowserWithState = connect(mapStateToProps)(StoryGroupBrowser);

export default withTracker(props => ({
    ...props,
    slots: Slots.find({}).fetch(),
}))(props => (
    <ConversationOptionsContext.Consumer>
        {value => <BrowserWithState {...props} stories={value.stories} />}
    </ConversationOptionsContext.Consumer>
));
