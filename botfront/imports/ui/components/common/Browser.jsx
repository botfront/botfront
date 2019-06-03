import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon, Input } from 'semantic-ui-react';

class Browser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            addMode: false,
            newItemName: '',
        };
    }

    handleChangeNewItemName = (_, data) => {
        this.setState({ newItemName: data.value });
    }

    handleKeyDownInput = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            const { onAdd } = this.props;
            const { newItemName } = this.state;
            onAdd(newItemName);
            this.resetAddItem();
        }
    }

    resetAddItem = () => {
        this.setState({ addMode: false, newItemName: '' });
    }

    render() {
        const {
            data, index: indexProp, pageSize, onChange, allowAddition, nameAccessor,
        } = this.props;

        const { addMode, newItemName, page } = this.state;

        const items = data.map((item, index) => (
            <Menu.Item
                key={index.toString()}
                name={item[nameAccessor]}
                active={indexProp === index}
                onClick={() => onChange(index)}
                link
            >
                <span>
                    {item[nameAccessor]}
                </span>
            </Menu.Item>
        ));
        

        if (allowAddition) {
            items.push(!addMode ? (
                <Menu.Item
                    key='newItem'
                    onClick={() => this.setState({ addMode: true })}
                    link
                >
                    <Icon name='add' />
                    <span>Add</span>
                </Menu.Item>
            ) : (
                <Menu.Item
                    key='newItem'
                >
                    <Input
                        onChange={this.handleChangeNewItemName}
                        value={newItemName}
                        onKeyDown={this.handleKeyDownInput}
                        autoFocus
                        onBlur={this.resetAddItem}
                    />
                </Menu.Item>
            ));
        }

        return (
            <Menu pointing vertical fluid>
                {items}
            </Menu>
        );
    }
}

Browser.propTypes = {
    data: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    index: PropTypes.number,
    pageSize: PropTypes.number,
    allowAddition: PropTypes.bool,
    onAdd: PropTypes.func,
    nameAccessor: PropTypes.string,
};

Browser.defaultProps = {
    onChange: () => {},
    index: 0,
    pageSize: 20,
    allowAddition: false,
    onAdd: () => {},
    nameAccessor: '_id',
};

export default Browser;
