import React from 'react';
import PropTypes from 'prop-types';
import {
    Input, Dropdown, Button, Icon,
} from 'semantic-ui-react';
import getColor from '../../../../lib/getColors';

const SORT_KEY_MAP = {
    updatedAt: 'numeric',
    intent: 'alphabet',
};

export default class Filters extends React.Component {
    state = {
        sortDropdownOpen: false,
    };

    getIntentsOptions = () => {
        const { intents } = this.props;
        return intents.map(i => ({ text: i, value: i }));
    };

    getEntitiesOptions = () => {
        const { entities } = this.props;
        return entities.map(e => ({ text: e, value: e }));
    };

    handleIntentSelectorChange = (e, { value }) => {
        const {
            onChange,
            filter: {
                entities: entitiesFilter, query, sortKey, order,
            },
        } = this.props;
        onChange({
            intents: value,
            entities: entitiesFilter,
            query,
            sortKey,
            order,
        });
    };

    handleEntitiesSelectorChange = (e, { value }) => {
        const {
            onChange,
            filter: {
                intents: intentsFilter, query, sortKey, order,
            },
        } = this.props;
        onChange({
            intents: intentsFilter,
            entities: value,
            query,
            sortKey,
            order,
        });
    };

    handleTextChange = (e, { value: query }) => {
        const {
            filter: {
                intents: intentsFilter,
                entities: entitiesFilter,
                sortKey,
                order,
            },
            onChange,
        } = this.props;
        onChange({
            query,
            intents: intentsFilter,
            entities: entitiesFilter,
            sortKey,
            order,
        });
    };

    handleSortKeyChange = (e, { value: sortKey }) => {
        const {
            filter: {
                intents: intentsFilter,
                entities: entitiesFilter,
                query,
                order,
            },
            onChange,
        } = this.props;
        onChange({
            query,
            intents: intentsFilter,
            entities: entitiesFilter,
            sortKey,
            order,
        });
    };

    handleorderChange = (order) => {
        const {
            filter: {
                intents: intentsFilter, entities: entitiesFilter, query, sortKey,
            },
            onChange,
        } = this.props;
        onChange({
            query,
            intents: intentsFilter,
            entities: entitiesFilter,
            order,
            sortKey,
        });
    };

    render() {
        const {
            filter: {
                intents: intentsFilter = [],
                entities: entitiesFilter = [],
                query,
                sortKey,
                order,
            },
            intents,
            entities,
            className,
        } = this.props;
        const { sortDropdownOpen } = this.state;
        const renderIntentLabel = label => ({
            color: 'purple',
            content: `${label.text}`,
        });
        const renderEntityLabel = label => ({
            color: getColor(label.text, true),
            content: `${label.text}`,
        });

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

                <Input
                    icon='search'
                    placeholder='Search...'
                    onChange={this.handleTextChange}
                    value={query}
                />
                <Button.Group basic>
                    <Button
                        content={(
                            <Icon
                                name={`sort ${SORT_KEY_MAP[sortKey]} ${
                                    order === 'ASC' ? 'ascending' : 'descending'
                                }`}
                            />
                        )}
                        onClick={() => this.handleorderChange(
                            order === 'ASC' ? 'DESC' : 'ASC',
                        )}
                    />
                    <Button
                        content={(
                            <Dropdown
                                onClick={() => this.setState({ sortDropdownOpen: !sortDropdownOpen })}
                                onClose={() => this.setState({ sortDropdownOpen: false })}
                                placeholder='Choose sort'
                                size='tiny'
                                open={sortDropdownOpen}
                                onChange={this.handleSortKeyChange}
                                value={sortKey}
                                floating
                                options={[
                                    { text: 'Date', value: 'updatedAt' },
                                    { text: 'Intent', value: 'intent' },
                                ]}
                            />
                        )}
                        onClick={() => this.setState({ sortDropdownOpen: !sortDropdownOpen })}
                    />
                </Button.Group>
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
