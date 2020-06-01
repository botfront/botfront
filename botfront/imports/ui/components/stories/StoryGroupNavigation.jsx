import {
    Icon, Input, Button, Popup,
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
        const { addGroup, updateGroup, createForm } = this.props;
        console.log(this.props);
        if (addMode === 'form') {
            createForm({ name: newItemName, slots: [] });
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
                    {this.tooltipWrapper(
                        <Button
                            key='newItem'
                            onClick={() => this.setState({ addMode: 'group' })}
                            data-cy='add-item'
                            icon
                            disabled={!allowAddition}
                            content={<Icon name='add' />}
                            style={{ width: 0 }}
                        />,
                        'New story group',
                    )}
                    {this.tooltipWrapper(
                        <Button
                            key='newForm'
                            onClick={() => this.setState({ addMode: 'form' })}
                            data-cy='add-form'
                            icon
                            disabled={!allowAddition}
                            content={<Icon name='add' />}
                            style={{ width: 0 }}
                        />,
                        'New form',
                    )}
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
        const {
            allowAddition,
            placeholderAddItem,
        } = this.props;
        const { addMode, newItemName } = this.state;

        return !allowAddition || !addMode
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
                    className='navigation'
                />
            );
    }
}

StoryGroupNavigation.propTypes = {
    allowAddition: PropTypes.bool,
    placeholderAddItem: PropTypes.string,
    modals: PropTypes.object.isRequired,
    onSwitchStoryMode: PropTypes.func.isRequired,
    storyMode: PropTypes.string.isRequired,
    addGroup: PropTypes.func.isRequired,
    updateGroup: PropTypes.func.isRequired,
    createForm: PropTypes.func.isRequired,
};

StoryGroupNavigation.defaultProps = {
    allowAddition: false,
    placeholderAddItem: '',
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
