/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Menu, Icon, Popup } from 'semantic-ui-react';
import propTypes from 'prop-types';
import React from 'react';

import ConfirmPopup from '../common/ConfirmPopup';

class BranchTabLabel extends React.Component {
    constructor(props) {
        super(props);
        const { value } = this.props;
        this.state = {
            newTitle: value,
            title: value,
            titleHovered: false,
            titleInputFocused: false,
            blockEditOptions: false,
            deletePopupOpened: false,
            popupTimer: null,
        };
    }

    componentWillUnmount() {
        const { popupTimer } = this.state;
        clearTimeout(popupTimer);
    }

    onTextInput = (event) => {
        this.setState({ newTitle: event.target.value.replace('_', '') });
    };

    handleTitleMouseEnter = () => {
        const { popupTimer } = this.state;
        clearTimeout(popupTimer);
        this.setState({ titleHovered: true });
    };

    handleTitleMouseLeave = () => {
        const { titleInputFocused } = this.state;
        if (!titleInputFocused) {
            this.setState({
                popupTimer: setTimeout(() => {
                    this.setState({ titleHovered: false, deletePopupOpened: false });
                }, 200),
            });
        }
    };

    handleOnFocusInput = () => {
        this.setState({ titleInputFocused: true });
    };

    handleFocusTitleInput = () => {
        const { active } = this.props;
        if (active) {
            this.setState({ titleInputFocused: true });
        }
    };

    submitNewTitle = () => {
        const { newTitle, title } = this.state;
        const {
            onChangeName, active, onSelect, siblings,
        } = this.props;
        this.setState({ titleHovered: false, titleInputFocused: false });
        if (title === newTitle) return;
        if (
            !newTitle.replace(/\s/g, '').length
            || siblings.map(s => s.title).includes(newTitle)
        ) {
            this.setState({ newTitle: title });
            return;
        }
        if (active) {
            onSelect(newTitle);
        }
        this.setState({ title: newTitle });
        onChangeName(newTitle);
    };

    handleKeyDown = (event) => {
        const { title } = this.state;
        
        if (event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            this.submitNewTitle();
            this.setState({ titleInputFocused: false, titleHovered: false });
            return;
        }
        if (event.key === 'Escape') {
            event.stopPropagation();
            event.preventDefault();
            this.setState({ newTitle: title, titleInputFocused: false, titleHovered: false });
        }
    }

    renderAlertIcons = () => {
        const { hasWarning, hasError } = this.props;
        const alertList = [];
        if (hasWarning) {
            alertList.push(<Icon name='warning' color='yellow' />);
        }
        if (hasError) {
            alertList.push(<Icon name='close' color='red' />);
        }
        return <>{alertList}</>;
    };

    renderDeleteButton = () => (
        <Icon name='trash' size='small' data-cy='delete-branch' />
    );

    handleOnClick = () => {
        const { title } = this.state;
        const { onSelect, active } = this.props;
        if (!active) {
            this.setState({ blockEditOptions: true });
            setTimeout(() => {
                this.setState({ blockEditOptions: false });
            }, 500);
            onSelect(title);
        }
    };

    renderTitlePlain = () => {
        const { title } = this.state;
        return (
            <>
                <span role='textbox' onClick={this.handleFocusTitleInput} tabIndex={0}>
                    {title}
                </span>
                {this.renderDeleteButton()}
            </>
        );
    };

    renderTitleDecorated = () => {
        const { title, deletePopupOpened } = this.state;
        const { onDelete, siblings } = this.props;
        const confirmMessage = {};
        if (siblings.length < 3) {
            const strandedBranchName = siblings.filter(s => s.title !== title)[0].title;
            confirmMessage.content = (
                <>
                    The content of branch <strong>{strandedBranchName}</strong> is also
                    going to get deleted.
                </>
            );
        }
        return (
            <>
                <span
                    className='decorated'
                    onClick={this.handleFocusTitleInput}
                    role='textbox'
                    tabIndex={0}
                >
                    {title}
                </span>
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
            </>
        );
    };

    renderTitleInput = () => {
        const { newTitle } = this.state;
        return (
            <>
                <input
                    data-cy='branch-title-input'
                    value={newTitle}
                    onChange={this.onTextInput}
                    onBlur={this.submitNewTitle}
                    onKeyDown={this.handleKeyDown}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    onFocus={this.handleOnFocusInput}
                    style={{ width: `${Math.max(3, newTitle.length + 1)}ch` }}
                />
                {this.renderDeleteButton()}
            </>
        );
    };

    renderTitle = () => {
        const { titleHovered, titleInputFocused, blockEditOptions } = this.state;
        const { active } = this.props;
        if (titleInputFocused) {
            return this.renderTitleInput();
        }
        if (active && titleHovered && !blockEditOptions) {
            return this.renderTitleDecorated();
        }
        return this.renderTitlePlain();
    };

    render() {
        const { active } = this.props;
        return (
            <Menu.Item
                active={active}
                onClick={this.handleOnClick}
                content={
                    <>
                        {this.renderAlertIcons()}
                        {this.renderTitle()}
                    </>
                }
                onMouseEnter={this.handleTitleMouseEnter}
                onMouseLeave={this.handleTitleMouseLeave}
                role='textbox'
                data-cy='branch-label'
            />
        );
    }
}

BranchTabLabel.propTypes = {
    value: propTypes.string,
    onChangeName: propTypes.func.isRequired,
    onDelete: propTypes.func.isRequired,
    hasError: propTypes.bool,
    hasWarning: propTypes.bool,
    active: propTypes.bool,
    onSelect: propTypes.func.isRequired,
    siblings: propTypes.array.isRequired,
};

BranchTabLabel.defaultProps = {
    value: '',
    active: false,
    hasError: false,
    hasWarning: false,
};
export default BranchTabLabel;
