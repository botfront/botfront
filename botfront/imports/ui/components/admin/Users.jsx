import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import matchSorter from 'match-sorter';
import PropTypes from 'prop-types';
import {
    Container, Table, Menu, Button, Icon, Popup,
} from 'semantic-ui-react';
import React from 'react';
import ReactTable from 'react-table-v6';
import { Link, browserHistory } from 'react-router';
import PageMenu from '../utils/PageMenu';
import { can } from '../../../lib/scopes';
import { wrapMeteorCallback } from '../utils/Errors';

class UsersList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            usersLeft: 0,
        };
    }

    componentDidMount() {
        Meteor.call('checkLicenseUserLeft', wrapMeteorCallback((err, left) => {
            if (typeof left === 'number') this.setState({ usersLeft: left });
        }));
    }

    renderListItems = ({ users } = this.props) => users.map(user => (
        <Table.Row key={user._id} data-cy={user.profile.lastName}>
            <Table.Cell>
                <Link to={`/admin/user/${user._id}`}>{user.emails[0].address}</Link>
            </Table.Cell>
        </Table.Row>
    ));

    filterItem = (filter, rows, filterKey) => {
        if (matchSorter([rows], filter.value, { keys: [filterKey] }).length > 0) return true;
        return false;
    }

    getColumns = () => [
        {
            Header: 'Last Name',
            id: 'lastname',
            accessor: 'profile.lastName',
            filterable: true,
            filterMethod: (filter, rows) => (this.filterItem(filter, rows, 'lastname')),
            Cell: props => (
                <Link to={`/admin/user/${props.original._id}`}>{props.value}</Link>
            ),
        },
        {
            Header: 'First Name',
            id: 'firstname',
            accessor: 'profile.firstName',
            filterable: true,
            filterMethod: (filter, rows) => (this.filterItem(filter, rows, 'firstname')),
            Cell: props => (
                <Link to={`/admin/user/${props.original._id}`}>{props.value}</Link>
            ),
        },
        {
            Header: 'Email',
            id: 'email',
            accessor: 'emails[0].address',
            filterable: true,
            filterMethod: (filter, rows) => (this.filterItem(filter, rows, 'email')),
            Cell: props => (
                <Link to={`/admin/user/${props.original._id}`}>{props.value}</Link>
            ),
        },
        {
            id: 'edit',
            accessor: '_id',
            width: 55,
            Header: 'Edit',
            Cell: props => (
                <div className='center'>
                    <Link to={`/admin/user/${props.value}`}>
                        <Icon name='edit' color='grey' link size='small' data-cy='edit-user' />
                    </Link>
                </div>
            ),
        },
    ];


    render() {
        const { loading, users } = this.props;
        const { usersLeft } = this.state;

        return (
            <div>
                <PageMenu title='Users' icon='users'>
                    <Menu.Menu position='right'>
                        {can('users:w', { anyScope: true }) && (
                            <Menu.Item>
                                <Popup
                                    trigger={(
                                        <div data-cy='new-user-trigger'>
                                            <Button
                                                data-cy='new-user'
                                                onClick={() => {
                                                    browserHistory.push('/admin/user/add');
                                                }}
                                                primary
                                                disabled={loading || usersLeft <= 0}
                                                icon='add'
                                                content='Add user'
                                                labelPosition='left'
                                            />
                                        </div>
                                    )}
                                    content='You have reached the maximum number of users granted by your license'
                                    disabled={usersLeft > 0}
                                    inverted
                                    data-cy='user-license-limit'
                                />
                            </Menu.Item>
                        )}
                    </Menu.Menu>
                </PageMenu>
                <Container>
                    <ReactTable
                        data={users}
                        columns={this.getColumns()}
                        getTrProps={() => ({
                            style: {
                                height: '37px',
                                paddingLeft: '10px',
                            },
                        })}
                    />
                </Container>
            </div>
        );
    }
}

UsersList.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    users: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
    const usersHandle = Meteor.subscribe('userData');
    const users = Meteor.users.find({}).fetch();
    const loading = !usersHandle.ready();

    return {
        users: users || {},
        loading,
    };
})(UsersList);
