import {
    Icon, Input, Button, Popup, Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { setStoryMode } from '../../store/actions/actions';
import { Slots } from '../../../api/slots/slots.collection';
import { ConversationOptionsContext } from './Context';

class StoryGroupNavigation extends React.Component {
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
        const {
            editing, newItemName, itemName, addMode,
        } = this.state;
        const { addGroup, updateGroup, upsertForm } = this.props;
        if (addMode === 'form') {
            upsertForm({ name: newItemName, slots: [] });
            this.resetAddItem();
            return;
        }
        if (editing === -1 && !!newItemName) {
            addGroup({ name: newItemName });
            this.resetAddItem();
            return;
        }
        if (editing !== -1 && !!itemName) {
            updateGroup({ ...element, name: itemName });
            this.setState({ editing: -1 });
            return;
        }
        this.resetRenameItem();
        this.resetAddItem();
    };

    resetAddItem = () => {
        this.setState({ addMode: false, newItemName: '' });
    };

    resetRenameItem = () => {
        this.setState({ editing: -1 });
    };

    tooltipWrapper = (trigger, tooltip) => (
        <Popup size='mini' inverted content={tooltip} trigger={trigger} />
    );

    renderNavigation = () => {
        const {
            modals, storyMode, onSwitchStoryMode, allowAddition,
        } = this.props;
        return (
            <div className='navigation'>
                <Button.Group fluid>
                    <Dropdown
                        icon='add'
                        button
                        className='icon'
                        data-cy='add-item'
                        disabled={!allowAddition}
                        style={{ textAlign: 'center' }}
                    >
                        <Dropdown.Menu>
                            <Dropdown.Item
                                icon='book'
                                content='Story group'
                                data-cy='add-story-group'
                                onClick={() => this.setState({ addMode: 'group' })}
                            />
                            <Dropdown.Item
                                icon='wpforms'
                                content='Form'
                                data-cy='add-form'
                                onClick={() => this.setState({ addMode: 'form' })}
                            />
                        </Dropdown.Menu>
                    </Dropdown>
                    {this.tooltipWrapper(
                        <Button
                            content='Slots'
                            onClick={() => modals.setSlotsModal(true)}
                            data-cy='slots-modal'
                        />,
                        'Manage slots',
                    )}
                    {this.tooltipWrapper(
                        <Button
                            content='Policies'
                            onClick={() => modals.setPoliciesModal(true)}
                            data-cy='policies-modal'
                        />,
                        'Edit Policies',
                    )}
                    {this.tooltipWrapper(
                        <Button
                            data-cy={storyMode === 'visual' ? 'toggle-md' : 'toggle-visual'}
                            icon
                            onClick={() => onSwitchStoryMode(storyMode === 'visual' ? 'markdown' : 'visual')}
                        >
                            <Icon name={storyMode === 'visual' ? 'code' : 'commenting'} />
                        </Button>,
                        storyMode === 'visual' ? 'Switch to Markdown edit mode' : 'Switch to visual edit mode',
                    )}
                </Button.Group>
            </div>
        );
    };

    render() {
        const { allowAddition } = this.props;
        const { addMode, newItemName } = this.state;
        let placeholder = '';
        if (addMode === 'group') placeholder = 'Choose a group name';
        if (addMode === 'form') placeholder = 'Choose a form name';

        return !allowAddition || !addMode
            ? this.renderNavigation()
            : (
                <Popup
                    size='mini'
                    inverted
                    content={<span>Form names must end with <i>_form</i> and have no special characters.</span>}
                    disabled={addMode !== 'form' || newItemName.match(/^[a-zA-Z0-9-_]+_form$/)}
                    position='bottom center'
                    open
                    trigger={(
                        <Input
                            placeholder={placeholder}
                            onChange={this.handleChangeNewItemName}
                            value={newItemName}
                            onKeyDown={this.handleKeyDownInput}
                            autoFocus
                            onBlur={() => this.submitTitleInput()}
                            fluid
                            data-cy='add-item-input'
                            className='navigation'
                        />

                    )}
                />
            );
    }
}

StoryGroupNavigation.propTypes = {
    allowAddition: PropTypes.bool,
    modals: PropTypes.object.isRequired,
    onSwitchStoryMode: PropTypes.func.isRequired,
    storyMode: PropTypes.string.isRequired,
    addGroup: PropTypes.func.isRequired,
    updateGroup: PropTypes.func.isRequired,
    upsertForm: PropTypes.func.isRequired,
};

StoryGroupNavigation.defaultProps = {
    allowAddition: false,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    storyMode: state.stories.get('storyMode'),
});

const mapDispatchToProps = {
    onSwitchStoryMode: setStoryMode,
};

const BrowserWithState = connect(mapStateToProps, mapDispatchToProps)(StoryGroupNavigation);

export default withTracker(props => ({
    ...props,
    slots: Slots.find({}).fetch(),
}))(props => (
    <ConversationOptionsContext.Consumer>
        {value => <BrowserWithState {...props} {...value} />}
    </ConversationOptionsContext.Consumer>
));
