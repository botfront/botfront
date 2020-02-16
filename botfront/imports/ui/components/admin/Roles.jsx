import { Menu, Button, Container } from 'semantic-ui-react';
import { useQuery } from '@apollo/react-hooks';
import ReactTable from 'react-table-v6';
import React from 'react';

import { GET_ROLES_DATA } from '../utils/queries';
import { PageMenu } from '../utils/Utils';

const columns = [
    { id: 'name', accessor: 'name', Header: 'Name' },
    { id: 'description', accessor: 'description', Header: 'Description' },
];
const RolesList = () => {
    const { loading, data } = useQuery(GET_ROLES_DATA);
    console.log(data);
    return (
        <div>
            <PageMenu icon='sitemap' title='Roles'>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button primary icon='add' content='Create Role' />
                    </Menu.Item>
                </Menu.Menu>
            </PageMenu>
            <Container>
                {!loading && (
                    <ReactTable data={data.getRolesData} columns={columns} />
                )}
            </Container>
        </div>
    );
};

export default RolesList;
