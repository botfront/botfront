/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Menu, Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import ConfirmPopup from '../common/ConfirmPopup';
import ToolTipPopup from '../common/ToolTipPopup';

class BranchTabLabel extends React.Component {
    constructor(props) {
        super(props);
        const { value } = this.props;
        this.state = {
            newTitle: value,
            deletePopupOpened: false,
        };
    }

    onTextInput = (event) => {
        this.setState({ newTitle: event.target.value.replace('_', '') });
    };

    submitNewTitle = () => {
        const { newTitle } = this.state;
        const {
            onChangeName, active, onSelect, siblings, value,
        } = this.props;
        if (value === newTitle) return;
        if (
            !newTitle.replace(/\s/g, '').length
            || siblings.map(s => s.title).includes(newTitle)
        ) {
            this.setState({ newTitle: value });
            return;
        }
        if (active) {
            onSelect(newTitle);
        }
        onChangeName(newTitle);
    };

    handleKeyDown = (event) => {
        const { value } = this.props;
        if (event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            this.submitNewTitle();
            return;
        }
        if (event.key === 'Escape') {
            event.stopPropagation();
            event.preventDefault();
            this.setState({
                newTitle: value,
            });
        }
    };

    renderAlertIcons = () => {
        const { errors, warnings } = this.props;
        const alertList = [];
        if (warnings) {
            alertList.push(
                <Icon
                    key='warning-icon'
                    name='exclamation circle'
                    color='yellow'
                    data-cy='branch-tab-warning-alert'
                />,
            );
        }
        if (errors) {
            alertList.push(
                <Icon
                    key='error-icon'
                    name='times circle'
                    color='red'
                    data-cy='branch-tab-error-alert'
                />,
            );
        }
        return <>{alertList}</>;
    };

    renderDeleteButton = () => {
        const { isLinked, siblings, isParentLinked } = this.props;
        return (
            <Icon name='trash' disabled={isLinked || (siblings.length < 3 && isParentLinked === true)} size='small' data-cy='delete-branch' />
        );
    };

    handleOnClick = () => {
        const { onSelect, active, value } = this.props;
        if (!active) onSelect(value);
    };

    renderDeletePopup = () => {
        const { deletePopupOpened } = this.state;
        const {
            onDelete, siblings, isLinked, isParentLinked, value,
        } = this.props;
        const confirmMessage = {};
        if (siblings.length < 3) {
            const strandedBranchName = siblings.filter(s => s.title !== value)[0].title;
            confirmMessage.content = (
                <>
                    The content of <strong>{strandedBranchName}</strong> will be added to
                    the previous story.
                </>
            );
        }
        if (isLinked) {
            return (
                <ToolTipPopup
                    header='This story cannot be deleted'
                    toolTipText={[
                        'A story that is linked to another story cannot be deleted',
                    ]}
                    trigger={this.renderDeleteButton()}
                />
            );
        }
        if (siblings.length < 3 && isParentLinked) {
            return (
                <ToolTipPopup
                    header='This story cannot be deleted'
                    toolTipText={[
                        'A story that has a only one sibling branch which is linked cannot be deleted',
                    ]}
                    trigger={this.renderDeleteButton()}
                />
            );
        }
        return (
            <Popup
                trigger={this.renderDeleteButton()}
                content={(
                    <ConfirmPopup
                        title='Delete branch?'
                        {...confirmMessage}
                        onYes={() => {
                            this.setState({ deletePopupOpened: false });
                            onDelete();
                        }}
                        onNo={() => this.setState({ deletePopupOpened: false })}
                    />
                )}
                on='click'
                open={deletePopupOpened}
                onOpen={() => this.setState({ deletePopupOpened: true })}
                onClose={() => this.setState({ deletePopupOpened: false })}
            />
        );
    };

    renderTitle = () => {
        const { newTitle } = this.state;
        return (
            <>
                <input
                    data-cy='branch-title-input'
                    value={newTitle}
                    onChange={this.onTextInput}
                    onBlur={this.submitNewTitle}
                    onKeyDown={this.handleKeyDown}
                    style={{ width: `${Math.max(3, newTitle.length + 1)}ch` }}
                />
                {this.renderDeletePopup()}
            </>
        );
    };

    render() {
        const { active } = this.props;
        return (
            <Menu.Item
                active={active}
                onClick={this.handleOnClick}
                content={(
                    <>
                        {this.renderAlertIcons()}
                        {this.renderTitle()}
                    </>
                )}
                role='textbox'
                data-cy='branch-label'
            />
        );
    }
}

BranchTabLabel.propTypes = {
    value: PropTypes.string,
    onChangeName: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    warnings: PropTypes.number,
    errors: PropTypes.number,
    active: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    siblings: PropTypes.array.isRequired,
    isLinked: PropTypes.bool,
    isParentLinked: PropTypes.bool.isRequired,
};

BranchTabLabel.defaultProps = {
    value: '',
    active: false,
    warnings: 0,
    errors: 0,
    isLinked: true,
};
export default BranchTabLabel;
