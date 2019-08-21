/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Menu, Icon } from 'semantic-ui-react';
import propTypes from 'prop-types';
import React from 'react';


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
        };
    }

    onTextInput = (event) => {
        this.setState({ newTitle: event.target.value });
    }

    handleTitleMouseEnter = () => {
        this.setState({ titleHovered: true });
    }

    handleTitleMouseLeave = () => {
        const { titleInputFocused } = this.state;
        if (!titleInputFocused) {
            this.setState({ titleHovered: false });
        }
    }

    handleOnFocusInput = () => {
        this.setState({ titleInputFocused: true });
    }

    handleFocusTitleInput = () => {
        const { active } = this.props;
        if (active) {
            this.setState({ titleInputFocused: true });
        }
    }

    onBlurInput = () => {
        const { newTitle, title } = this.state;
        const { onChangeName, active, onSelect } = this.props;
        this.setState({ titleHovered: false, titleInputFocused: false });
        if (title === newTitle) {
            return;
        }
        if (!newTitle.replace(/\s/g, '').length) {
            this.setState({ newTitle: title });
            return;
        }
        if (active) {
            onSelect(newTitle);
        }
        this.setState({ title: newTitle });
        onChangeName(newTitle);
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
    }

    handleOnClick = () => {
        const { title } = this.state;
        const { onSelect, active } = this.props;
        if (!active) {
            this.setState({ blockEditOptions: true });
            setTimeout(() => { this.setState({ blockEditOptions: false }); }, 500);
            onSelect(title);
        }
    }

    renderTitlePlain = () => {
        const { title } = this.state;
        return (
            <span
                className='branch-title'
                role='textbox'
                onClick={this.handleFocusTitleInput}
                tabIndex={0}
            >
                {title}
            </span>
        );
    }

    renderTitleDecorated = () => {
        const { title } = this.state;
        const { onDelete } = this.props;
        return (
            <>
                <span
                    className='branch-title decorated'
                    onClick={this.handleFocusTitleInput}
                    role='textbox'
                    tabIndex={0}
                >
                    {title}
                </span>
                <Icon name='trash' className='trash-icon visible' onClick={onDelete} />
            </>
        );
    }

    renderTitleInput = () => {
        const { newTitle } = this.state;
        const { onDelete } = this.props;
        return (
            <>
                <input
                    data-cy='branch-title'
                    value={newTitle}
                    onChange={this.onTextInput}
                    onBlur={this.onBlurInput}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    onFocus={this.handleOnFocusInput}
                />
                <Icon name='trash' className='trash-icon visible' onClick={onDelete} />
            </>
        );
    }

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
    }

    render() {
        const { active } = this.props;
        return (
            <Menu.Item
                className='branch-tab'
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
};

BranchTabLabel.defaultProps = {
    value: '',
    active: false,
    hasError: false,
    hasWarning: false,
};
export default BranchTabLabel;
