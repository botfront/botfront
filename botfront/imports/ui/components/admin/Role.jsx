import {
    AutoForm, AutoField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Container, Segment } from 'semantic-ui-react';
import SimpleSchema from 'simpl-schema';
import PropTypes from 'prop-types';

import { rolesDataSimpleSchema as rolesDataSchema } from '../../../api/graphql/rolesData/rolesData.model';
import SelectField from '../form_fields/SelectField';
import { GET_ROLES_DATA } from '../utils/queries';
import { PageMenu } from '../utils/Utils';

const children = new SimpleSchema({
    children: [String],
});

const rolesDataSchemaWithChildren = children.extend(rolesDataSchema);

const Role = (props) => {
    const { params } = props;
    const { role_name: roleName } = params;
    const [roleData, setRoleData] = useState(null);
    const [rolesOptions, setRolesOptions] = useState([]);
    const { loading, data: rolesData } = useQuery(GET_ROLES_DATA);

    useEffect(() => {
        if (!loading) {
            const fetchedRolesData = rolesData.getRolesData;
            setRoleData(fetchedRolesData.find(role => role.name === roleName));
            setRolesOptions(fetchedRolesData.map(role => ({
                value: role.name,
                text: role.name,
                key: role.name,
                description: role.description,
            })));
        }
    }, [rolesData]);

    const handleSubmit = (role) => {

    };

    return (
        <>
            <PageMenu icon='shield alternate' title={roleName || 'New Role'} />
            <Container>
                <Segment>
                    {!!roleData && (
                        <AutoForm
                            schema={rolesDataSchemaWithChildren}
                            model={roleData}
                        >
                            <AutoField name='name' />
                            <AutoField name='description' />
                            <SelectField name='children' options={rolesOptions} />
                            <ErrorsField />
                            <SubmitField />
                        </AutoForm>
                    )}
                </Segment>
            </Container>
        </>
    );
};

Role.propTypes = {
    params: PropTypes.shape({
        role_name: PropTypes.string,
    }).isRequired,
};

export default Role;
