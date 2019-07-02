import {
    Menu, Icon, Input, Loader, Button,
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
        const { editing } = this.state;
        if (event.key === 'Enter' && editing === -1) {
            event.preventDefault();
            event.stopPropagation();
            const { onAdd } = this.props;
            const { newItemName } = this.state;
            onAdd(newItemName);
            this.resetAddItem();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            const { changeName } = this.props;
            const { itemName } = this.state;
            changeName({ ...element, name: itemName });
            this.setState({ editing: -1 });
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

    resetRenameItem = () => {
        this.setState({ editing: -1 });
    };

    handleToggle = (event, element) => {
        event.stopPropagation();
        const { toggleSelect } = this.props;
        toggleSelect(element);
    }

    handleEdit = (index, itemName) => {
        this.setState({ editing: index, itemName });
    }

    render() {
        const {
            data,
            index: indexProp,
            pageSize,
            allowAddition,
            nameAccessor,
            saving,
            selectAccessor,
            allowEdit,
        } = this.props;

        const {
            addMode,
            newItemName,
            page,
            editing,
            itemName,
        } = this.state;

        const items = data.map((item, index) => (
            <Menu.Item
                key={index.toString()}
                name={item[nameAccessor]}
                className={`${indexProp === index ? 'selected-blue' : ''}`}
                active={indexProp === index}
                onClick={() => this.handleClickMenuItem(index)}
                link={indexProp !== index}
            >
                { editing !== index ? (
                    <React.Fragment>
                        {selectAccessor && (
                            <Icon
                                id={`${item[selectAccessor] ? 'selected' : 'not-selected'}`}
                                name='grid layout'
                                onClick={e => this.handleToggle(e, item)}
                            />
                        )}
                        {allowEdit && (
                            <Icon
                                id='edit-icon'
                                name='edit'
                                onClick={() => this.handleEdit(index, item[nameAccessor])}
                                data-cy='edit-name-icon'
                            />
                        )}
                        <span>{item[nameAccessor]}</span>
                        {indexProp === index && saving && (
                            <Loader active size='tiny' />
                        )}
                    </React.Fragment>
                ) : (
                    <Input
                        onChange={this.handleChangeOldName}
                        value={itemName}
                        onKeyDown={e => this.handleKeyDownInput(e, item)}
                        autoFocus
                        onBlur={this.resetRenameItem}
                        fluid
                        data-cy='edit-name'
                    />
                )
                }
                
            </Menu.Item>
        ));
        return (
            <React.Fragment>
                { allowAddition && (!addMode ? (
                    <Button
                        icon
                        labelPosition='left'
                        key='newItem'
                        onClick={() => this.setState({ addMode: true })}
                        link
                        data-cy='add-item'
                        fluid
                    >
                        <Icon name='add' />
                        Add a story group
                    </Button>
                ) : (
                    <Input
                        onChange={this.handleChangeNewItemName}
                        value={newItemName}
                        onKeyDown={this.handleKeyDownInput}
                        autoFocus
                        onBlur={this.resetAddItem}
                        fluid
                        data-cy='input-item'
                    />
                ))
                }
                {data.length > 0 && (
                    <Menu vertical fluid>
                        {items}
                    </Menu>
                )}
            </React.Fragment>
            
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
    selectAccessor: PropTypes.string,
    toggleSelect: PropTypes.func,
    changeName: PropTypes.func,
    allowEdit: PropTypes.bool,
};

Browser.defaultProps = {
    onChange: () => {},
    index: 0,
    pageSize: 20,
    allowAddition: false,
    onAdd: () => {},
    toggleSelect: () => {},
    changeName: () => {},
    nameAccessor: '_id',
    saving: false,
    selectAccessor: '',
    allowEdit: false,
};

export default Browser;
