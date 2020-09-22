import React from 'react';
import PropTypes from 'prop-types';
import {
    Input, Dropdown, Button, Icon,
} from 'semantic-ui-react';
// import moment from 'moment';
// import DatePicker from '../../common/DatePicker';
import { ProjectContext } from '../../../layouts/context';
// import { applyTimezoneOffset } from '../../../../lib/graphs';
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

    handleIntentSelectorChange = (_, { value: intents }) => {
        const { onChange, filter } = this.props;
        onChange({ ...filter, intents });
    };

    handleEntitiesSelectorChange = (_, { value: entities }) => {
        const { onChange, filter } = this.props;
        onChange({ ...filter, entities });
    };

    handleTextChange = (_, { value: query }) => {
        const { filter, onChange } = this.props;
        onChange({ ...filter, query });
    };

    handleSortKeyChange = (_, { value: sortKey }) => {
        const { onChange, filter } = this.props;
        onChange({ ...filter, sortKey });
    };

    handleOrderChange = (order) => {
        const { onChange, filter } = this.props;
        onChange({ ...filter, order });
    };

    // handleCalendarChange = (...bounds) => {
    //     const { filter, onChange } = this.props;
    //     const { project: { timezoneOffset: tz = 0 } = {} } = this.context;
    //     const [startDate, endDate] = bounds.map(date => moment(applyTimezoneOffset(date, tz)));
    //     onChange({ ...filter, dateRange: { startDate, endDate } });
    // };

    static contextType = ProjectContext;

    render() {
        const {
            filter: {
                intents: intentsFilter = [],
                entities: entitiesFilter = [],
                query,
                sortKey,
                order,
                // dateRange,
            },
            intents,
            entities,
            className,
        } = this.props;
        // const { startDate, endDate } = dateRange || {};
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
            <div className={`side-by-side narrow middle ${className}`}>
                {/* {dateRange !== undefined && (
                    <div className='date-picker' data-cy='date-picker-container'>
                        <DatePicker
                            startDate={startDate}
                            endDate={endDate}
                            onConfirm={this.handleCalendarChange}
                            placeholder='Filter by date'
                        />
                    </div>
                )} */}
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
                {order && sortKey && (
                    <Button.Group basic>
                        <Button
                            content={(
                                <Icon
                                    name={`sort ${SORT_KEY_MAP[sortKey]} ${
                                        order === 'ASC' ? 'ascending' : 'descending'
                                    }`}
                                />
                            )}
                            onClick={() => this.handleOrderChange(
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
                )}
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
