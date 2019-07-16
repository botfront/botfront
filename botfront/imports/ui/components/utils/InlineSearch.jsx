import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Popup } from 'semantic-ui-react';

import TextInput from './TextInput';

function SearchMenuItem({ name, activeName, onItemClick }) {
    function onClick() {
        onItemClick(name);
    }

    return (
        <Menu.Item className='search-menu-item left' name={name} active={name === activeName} onClick={onClick}>
            {name}
        </Menu.Item>
    );
}

SearchMenuItem.propTypes = {
    name: PropTypes.string.isRequired,
    activeName: PropTypes.string,
    onItemClick: PropTypes.func,
};

SearchMenuItem.defaultProps = {
    activeName: '',
    onItemClick: () => {},
};

function SearchMenu(props) {
    const {
        text,
        data,
        activeText,
        searchPrompt,
        onItemClick,
    } = props;

    const searchOn = activeText !== text;
    const menuItems = data.filter(name => (
        !searchOn || name.includes(activeText)
    )).map((name, index) => (
        <SearchMenuItem name={name} key={index.toString(10)} activeName={text} onItemClick={onItemClick} />
    ));

    return (
        <Menu vertical style={{ overflowX: 'hidden', overflowY: 'auto' }}>
            {searchOn && (
                <SearchMenuItem name={`${searchPrompt}: ${activeText}`} onItemClick={() => onItemClick(activeText)} />
            )}
            {menuItems}
        </Menu>
    );
}

SearchMenu.propTypes = {
    text: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    activeText: PropTypes.string,
    searchPrompt: PropTypes.string,
    onItemClick: PropTypes.func,
};

SearchMenu.defaultProps = {
    activeText: '',
    searchPrompt: 'Search',
    onItemClick: () => {},
};

export default class InlineSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false,
            text: props.text,
        };

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.listenForClose = this.listenForClose.bind(this);
        this.onTextChange = this.onTextChange.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
        this.onEnter = this.onEnter.bind(this);

        this.inputContainer = null;
    }

    componentWillReceiveProps(props) {
        const { text } = props;
        this.setState({ text });
    }

    onEnter() {
        this.close(false);
    }

    onTextChange(value) {
        this.setState({ text: value });
    }

    onItemClick(value) {
        const { text } = this.state;

        if (value === text) {
            this.close();
        } else {
            this.setState({ text: value });
            this.updateText(value);
        }
    }

    updateText(value) {
        const { text: defaultText, onUpdateText, text } = this.props;
        const { text: activeText } = this.state;

        const newText = value || activeText;

        if (newText !== text) {
            onUpdateText(newText, (err) => {
                if (err) {
                    onUpdateText(defaultText);
                }
            });
        }
    }

    listenForClose(event) {
        // Check if cursor is outside input
        if (!this.inputContainer.contains(event.target)) {
            this.close();
        }
    }

    close() {
        this.updateText();

        this.setState({ menuOpen: false });
        window.removeEventListener('click', this.listenForClose);
    }

    open() {
        window.addEventListener('click', this.listenForClose);
        this.setState({ menuOpen: true });
    }

    render() {
        const { text, data, searchPrompt, placeholder } = this.props;
        const { menuOpen, text: activeText } = this.state;

        return (
            <Popup
                className='inline_search fill_contents'
                trigger={(
                    <div className='trigger' ref={(node) => { this.inputContainer = node; }}>
                        <TextInput text={activeText} onTextChange={this.onTextChange} onEnter={this.onEnter} placeholder={placeholder} staticText={text} />
                    </div>
                )}
                content={(
                    <SearchMenu
                        activeText={activeText}
                        text={text}
                        data={data}
                        onItemClick={this.onItemClick}
                        searchPrompt={searchPrompt}
                    />
                )}
                basic
                open={menuOpen}
                onOpen={this.open}
                on='click'
                position='bottom center'
            />
        );
    }
}

InlineSearch.propTypes = {
    text: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    onUpdateText: PropTypes.func,
    searchPrompt: PropTypes.string,
    placeholder: PropTypes.bool,
};

InlineSearch.defaultProps = {
    onUpdateText: () => {},
    searchPrompt: 'Search',
    placeholder: false,
};
