import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react';
import LookupTableValueEditor from './LookupTableValueEditor';
import LookupTableListEditor from './LookupTableListEditor';

export default class AddLookupTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.emptyState();
    }

    onItemChanged = (item) => {
        this.setState({ item });
    };

    onSave = () => {
        const { onAdd, listAttribute } = this.props;
        const { item } = this.state;
        const obj = { ...item };

        // Weeds out empty list items
        obj[listAttribute] = obj[listAttribute].filter(listItem => listItem);
        
        onAdd(obj, (err) => {
            if (!err) this.setState(this.emptyState());
        });
    };

    emptyState() {
        const { listAttribute } = this.props;
        const obj = { value: '' };
        obj[listAttribute] = [];
        return { item: obj };
    }

    render() {
        const { listAttribute, valuePlaceholder, listPlaceholder } = this.props;
        const { item } = this.state;
        return (
            <Grid data-cy='add-item-row'>
                <Grid.Row>
                    <Grid.Column width={4}>
                        <LookupTableValueEditor
                            listAttribute={listAttribute}
                            placeholder={valuePlaceholder}
                            entitySynonym={item}
                            onEdit={this.onItemChanged}
                            autoFocus={false}
                        />
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <LookupTableListEditor
                            listAttribute={listAttribute}
                            placeholder={listPlaceholder}
                            entitySynonym={item}
                            onEdit={this.onItemChanged}
                            autoFocus={false}
                        />
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Button
                            content='Add'
                            onClick={this.onSave}
                            className='entity-synonym-save-button'
                            // disabling the add button if empty field
                            disabled={
                                !item.value
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
};
