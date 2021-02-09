import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
    Container, Segment, Button, Message,
} from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import { browserHistory } from 'react-router';
import SimpleSchema from 'simpl-schema';
import PropTypes from 'prop-types';

import { rolesDataSimpleSchema as rolesDataSchema } from '../../../api/graphql/rolesData/rolesData.model';
import { GET_ROLES_DATA, UPSERT_ROLES_DATA, DELETE_ROLE_DATA } from '../utils/queries';
import SelectField from '../form_fields/SelectField';
import DeleteRoleModal from './DeleteRoleModal';
import SaveButton from '../utils/SaveButton';
import PageMenu from '../utils/PageMenu';
import { can } from '../../../lib/scopes';

const children = new SimpleSchema({
    children: [String],
});

const rolesDataSchemaWithChildren = children.extend(rolesDataSchema);

const Role = (props) => {
    const { params } = props;
    const { role_name: roleName } = params;
    const [roleData, setRoleData] = useState(null);
    const [saved, setSaved] = useState(false);
    const [rolesOptions, setRolesOptions] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { loading, data: rolesData } = useQuery(GET_ROLES_DATA, {
        fetchPolicy: 'cache-and-network',
    });
    const [
        upsertRolesData,
        { loading: upsertLoading, called: upsertCalled },
    ] = useMutation(UPSERT_ROLES_DATA);
    const [deleteRoleData] = useMutation(DELETE_ROLE_DATA, {
        onCompleted: () => {
            browserHistory.push('/admin/roles');
        },
    });

    useEffect(() => {
        if (!loading) {
            const fetchedRolesData = rolesData.getRolesData;
            if (roleName) {
                setRoleData(fetchedRolesData.find(role => role.name === roleName));
            } else {
                setRoleData({
                    name: '',
                    description: '',
                    children: [],
                    deletable: true,
                });
            }
            setRolesOptions(
                fetchedRolesData.map(role => ({
                    value: role.name,
                    text: role.name,
                    key: role.name,
                    description: role.description,
                })),
            );
        }
    }, [rolesData]);

    useEffect(() => {
        let timeoutId;
        if (!upsertLoading && upsertCalled) {
            setSaved(true);
            timeoutId = setTimeout(() => setSaved(false), 2000);
            browserHistory.push(`/admin/role/${roleData.name}`);
        }
        return () => {
            clearInterval(timeoutId);
        };
    }, [upsertLoading, upsertCalled, roleData]);

    const handleSubmit = (role) => {
        upsertRolesData({
            variables: {
                roleData: {
                    _id: role._id,
                    name: role.name,
                    description: role.description,
                    children: role.children,
                },
            },
        });
        setRoleData(role);
    };

    const handleDeletion = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = (fallback) => {
        deleteRoleData({
            variables: {
                name: roleData.name,
                fallback,
            },
        });
    };

    const disabled = roleData && roleData.deletable === false;
    
    return (
        <>
            <PageMenu icon='shield alternate' title={roleName || 'New Role'} />
            <Container>
                {disabled && (
                    <Message info>
                        This role is a default role and thus cannot be modified.
                    </Message>
                )}
                <Segment>
                    {showDeleteModal && roleData && (
                        <DeleteRoleModal
                            roles={rolesOptions.filter(
                                options => options.value !== roleData.name
                                    && !options.value.includes(':'),
                            )}
                            onCancel={() => setShowDeleteModal(false)}
                            roleName={roleData.name}
                            onConfirm={handleConfirmDelete}
                        />
                    )}
                    {!!roleData && (
                        <AutoForm
                            schema={rolesDataSchemaWithChildren}
                            model={roleData}
                            onSubmit={handleSubmit}
                            disabled={disabled || !can('roles:w', { anyScope: true })}
                        >
                            <AutoField name='name' data-cy='role-name-input' />
                            <AutoField name='description' data-cy='role-description-input' />
                            <SelectField name='children' options={rolesOptions} data-cy='role-children-dropdown' />
                            <ErrorsField />
                            {can('roles:w', { anyScope: true }) && (
                                <><SaveButton disabled={disabled} saved={saved} />
                                    { roleData && roleData.name && (
                                        <Button
                                            data-cy='delete-role'
                                            negative
                                            content='Delete'
                                            disabled={disabled}
                                            floated='right'
                                            onClick={handleDeletion}
                                        />
                                    )}
                                </>
                            )}
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
