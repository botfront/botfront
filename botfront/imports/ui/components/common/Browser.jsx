import {
    Menu, Icon, Input, Loader,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import './style.less';

class Browser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            addMode: false,
            newItemName: '',
            hover: -1,
            hoverIcon: -1,
        };
    }

    handleChangeNewItemName = (_, data) => {
        this.setState({ newItemName: data.value });
    };

    handleKeyDownInput = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            const { onAdd } = this.props;
            const { newItemName } = this.state;
            onAdd(newItemName);
            this.resetAddItem();
        }
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

    handleToggle = (e, element) => {
        e.stopPropagation();
        const { toggleSelect } = this.props;
        toggleSelect(element);
    }

    render() {
        const {
            data,
            index: indexProp,
            pageSize,
            allowAddition,
            nameAccessor,
            saving,
            icon,
        } = this.props;

        const {
            addMode,
            newItemName,
            page,
            hover,
            hoverIcon,
        } = this.state;
        const items = data.map((item, index) => (
            <Menu.Item
                key={index.toString()}
                name={item[nameAccessor]}
                active={indexProp === index}
                onClick={() => this.handleClickMenuItem(index)}
                link={indexProp !== index}
                onMouseEnter={() => this.setState({ hover: index })}
                onMouseLeave={() => this.setState({ hover: -1 })}
            >
                {icon && (
                    <Icon
                        id={`${item.selected ? 'selected' : 'not-selected'}`}
                        className={`${hover === index ? 'hovered' : 'not-hovered'} ${hoverIcon === index ? 'hovered-icon' : ''}`}
                        name={icon}
                        onClick={e => this.handleToggle(e, item)}
                        onMouseEnter={() => this.setState({ hoverIcon: index })}
                        onMouseLeave={() => this.setState({ hoverIcon: -1 })}
                    />)
                }
                <span>{item[nameAccessor]}</span>
                {indexProp === index && saving && (
                    <Loader active size='tiny' />
                )}
            </Menu.Item>
        ));

        if (allowAddition) {
            items.unshift(
                !addMode ? (
                    <Menu.Item
                        key='newItem'
                        onClick={() => this.setState({ addMode: true })}
                        link
                        data-cy='add-item'
                    >
                        <Icon name='add' />
                        <span>Add</span>
                    </Menu.Item>
                ) : (
                    <Menu.Item key='newItem' data-cy='add-item'>
                        <Input
                            onChange={this.handleChangeNewItemName}
                            value={newItemName}
                            onKeyDown={this.handleKeyDownInput}
                            autoFocus
                            onBlur={this.resetAddItem}
                        />
                    </Menu.Item>
                ),
            );
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
    saving: PropTypes.bool,
    icon: PropTypes.string,
    toggleSelect: PropTypes.func,
};

Browser.defaultProps = {
    onChange: () => {},
    index: 0,
    pageSize: 20,
    allowAddition: false,
    onAdd: () => {},
    toggleSelect: () => {},
    nameAccessor: '_id',
    saving: false,
    icon: null,
};

export default Browser;
