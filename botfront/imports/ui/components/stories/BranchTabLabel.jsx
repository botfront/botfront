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
        };
    }

    onTextInput = (event) => {
        this.setState({ newTitle: event.target.value });
    }
    
    handleOnFocusInput = () => {
        this.setState({ titleInputFocused: true });
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
        if (title === active) {
            onSelect(newTitle);
        }
        this.setState({ title: newTitle });
        onChangeName(newTitle);
    }

    renderAlertIcons = () => {
        const { hasWarning, hasError } = this.props;
        const alertList = [];
        if (hasWarning) {
            alertList.push(<Icon name='warning' />);
        }
        if (hasError) {
            alertList.push(<Icon name='close' />);
        }
        return <>{alertList}</>;
    }

    renderErrors = () => {
        const { hasError } = this.props;
        if (hasError) {
            return <Icon name='close' />;
        }
        return <></>;
    }

    renderTitleInput = () => {
        const { titleHovered, newTitle } = this.state;
        if (titleHovered) {
            return (
                <input
                    data-cy='branch-title'
                    value={newTitle}
                    onChange={this.onTextInput}
                    onBlur={this.onBlurInput}
                    onFocus={this.handleOnFocusInput}
                />
            );
        }
        return (
            this.renderMenuDefault()
        );
    }

    renderMenuSelected = () => {
        const { onDelete } = this.props;
        const { titleInputFocused } = this.state;
        const styleTrash = { color: 'rgba(0,0,0,0.4)' };
        if (titleInputFocused) {
            styleTrash.visibility = 'visible';
            styleTrash.position = 'relative';
        }
        return (
            <>
                {this.renderTitleInput()}
                <Icon name='trash' className='trash-icon' onClick={onDelete} style={styleTrash} />
            </>
        );
    }

    renderMenuDefault = () => {
        const { title } = this.state;
        return (
            <>
                <span className='branch-title'>{title}</span>
            </>
        );
    }

    renderMenuItemContents = () => {
        const { active } = this.props;
        const { title } = this.state;
        if (active !== title) {
            return this.renderMenuDefault();
        }
        return <>{this.renderMenuSelected()}</>;
    }

    handleOnClick = () => {
        const { title } = this.state;
        const { onSelect } = this.props;
        onSelect(title);
    }

    render() {
        const { active } = this.props;
        const { title } = this.state;
        return (
            <Menu.Item
                className='branch-tab'
                active={title === active}
                onClick={this.handleOnClick}
                content={
                <>
                    {this.renderAlertIcons()}
                    {this.renderMenuItemContents()}
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
    active: propTypes.string,
    onSelect: propTypes.func.isRequired,
};

BranchTabLabel.defaultProps = {
    value: '',
    active: '',
    hasError: false,
    hasWarning: false,
};
export default BranchTabLabel;
