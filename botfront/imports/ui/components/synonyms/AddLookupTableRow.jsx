import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react';
import LookupTableValueEditor from './LookupTableValueEditor';
import LookupTableListEditor from './LookupTableListEditor';
import LookupTableStringEditor from './LookupTableStringEditor';

export default class AddLookupTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.emptyState();
    }

    onItemChanged = (item) => {
        this.setState({ item });
    };

    onSave = () => {
        const { onAdd, listAttribute, multiple } = this.props;
        const { item } = this.state;
        const obj = { ...item };

        // Weeds out empty list items
        if (multiple) obj[listAttribute] = obj[listAttribute].filter(listItem => listItem);
        
        onAdd(obj, (err) => {
            if (!err) this.setState(this.emptyState());
        });
    };

    emptyState() {
        const { multiple } = this.props;
        const { listAttribute, keyAttribute } = this.props;
        const obj = {
            [keyAttribute]: '',
            [listAttribute]: multiple ? [] : [''],
        };
        return { item: obj };
    }

    render() {
        const {
            listAttribute,
            keyAttribute,
            valuePlaceholder,
            listPlaceholder,
            multiple,
        } = this.props;
        const { item } = this.state;
        return (
            <Grid data-cy='add-item-row'>
                <Grid.Row>
                    <Grid.Column width={4}>
                        <LookupTableValueEditor
                            listAttribute={listAttribute}
                            keyAttribute={keyAttribute}
                            placeholder={valuePlaceholder}
                            entitySynonym={item}
                            onEdit={this.onItemChanged}
                            autoFocus={false}
                        />
                    </Grid.Column>
                    <Grid.Column width={10}>
                        { multiple ? (
                            <LookupTableListEditor
                                listAttribute={listAttribute}
                                placeholder={listPlaceholder}
                                entitySynonym={item}
                                onEdit={this.onItemChanged}
                                autoFocus={false}
                            />
                        ) : (
                            <LookupTableStringEditor
                                listAttribute={listAttribute}
                                placeholder={listPlaceholder}
                                item={item}
                                onEdit={this.onItemChanged}
                                autoFocus={false}
                            />
                        )}
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Button
                            content='Add'
                            onClick={this.onSave}
                            className='entity-synonym-save-button'
                            // disabling the add button if empty field
                            data-cy='save-new-table-row'
                            disabled={
                                !item[keyAttribute]
                                || !item[listAttribute].length
                                || (item[listAttribute].length === 1 && !item[listAttribute][0])
                            }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

AddLookupTableRow.propTypes = {
    onAdd: PropTypes.func.isRequired,
    valuePlaceholder: PropTypes.string.isRequired,
    listPlaceholder: PropTypes.string.isRequired,
    listAttribute: PropTypes.string.isRequired,
    keyAttribute: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
};

AddLookupTableRow.defaultProps = {
    multiple: true,
};
