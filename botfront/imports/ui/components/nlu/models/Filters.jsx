import React from 'react';
import PropTypes from 'prop-types';
import { Input, Dropdown, Button } from 'semantic-ui-react';
import getColor from '../../../../lib/getColors';

export default class Filters extends React.Component {
    getIntentsOptions = () => {
        const { intents } = this.props;
        return intents.map(i => ({ text: i, value: i }));
    }

    getEntitiesOptions = () => {
        const { entities } = this.props;
        return entities.map(e => ({ text: e, value: e }));
    }

    handleIntentSelectorChange = (e, { value }) => {
        const {
            onChange, filter: {
                entities: entitiesFilter, query, sortKey, sortOrder,
            },
        } = this.props;
        onChange({
            intents: value, entities: entitiesFilter, query, sortKey, sortOrder,
        });
    };

    handleEntitiesSelectorChange = (e, { value }) => {
        const {
            onChange, filter: {
                intents: intentsFilter, query, sortKey, sortOrder,
            },
        } = this.props;
        onChange({
            intents: intentsFilter, entities: value, query, sortKey, sortOrder,
        });
    };

    handleTextChange = (e, { value: query }) => {
        const {
            filter: {
                intents: intentsFilter, entities: entitiesFilter, sortKey, sortOrder,
            }, onChange,
        } = this.props;
        onChange({
            query, intents: intentsFilter, entities: entitiesFilter, sortKey, sortOrder,
        });
    };

    handleSortKeyChange = (e, { value: sortKey }) => {
        const {
            filter: {
                intents: intentsFilter, entities: entitiesFilter, query, sortOrder,
            }, onChange,
        } = this.props;
        onChange({
            query, intents: intentsFilter, entities: entitiesFilter, sortKey, sortOrder,
        });
    };

    handleSortOrderChange = (sortOrder) => {
        const {
            filter: {
                intents: intentsFilter, entities: entitiesFilter, query, sortKey,
            }, onChange,
        } = this.props;
        onChange({
            query, intents: intentsFilter, entities: entitiesFilter, sortOrder, sortKey,
        });
    };


    render() {
        const {
            filter: {
                intents: intentsFilter = [], entities: entitiesFilter = [], query, sortKey, sortOrder,
            }, intents, entities, className,
        } = this.props;
        const renderIntentLabel = label => ({ color: 'purple', content: `${label.text}` });
        const renderEntityLabel = label => ({ color: getColor(label.text, true), content: `${label.text}` });

        return (
            <div className={`side-by-side narrow ${className}`}>
                {intents.length > 0 && (
                    <Dropdown
                        style={{ marginRight: '10px' }}
                        placeholder='Filter by intents'
                        size='tiny'
                        onChange={this.handleIntentSelectorChange}
                        multiple
                        value={intentsFilter}
                        search
                        selection
                        renderLabel={renderIntentLabel}
                        options={this.getIntentsOptions()}
                    />
                )}
                {entities.length > 0 && (
                    <Dropdown
                        style={{ marginRight: '10px' }}
                        placeholder='Filter by entities'
                        size='tiny'
                        onChange={this.handleEntitiesSelectorChange}
                        value={entitiesFilter}
                        multiple
                        search
                        selection
                        renderLabel={renderEntityLabel}
                        options={this.getEntitiesOptions()}
                    />
                )}

                <Input icon='search' placeholder='Search...' onChange={this.handleTextChange} value={query} />

                <Dropdown
                    style={{ marginRight: '10px' }}
                    placeholder='Choose sort'
                    size='tiny'
                    onChange={this.handleSortKeyChange}
                    value={sortKey}
                    selection
                    options={[{ text: 'Date', value: 'updatedAt' }, { text: 'Intent', value: 'intent' }, { text: 'Draft', value: 'metadata.draft' }]}
                />

                <Button content={sortOrder} onClick={() => this.handleSortOrderChange(sortOrder === 'ASC' ? 'DESC' : 'ASC')} />
                
            </div>
        );
    }
}

Filters.defaultProps = {
    filter: null,
    className: 'left',
};

Filters.propTypes = {
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    filter: PropTypes.object,
    className: PropTypes.string,
};
