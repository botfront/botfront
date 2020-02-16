import { useQuery } from '@apollo/react-hooks';
import { Meteor } from 'meteor/meteor';
import React from 'react';

import { GET_ROLES_DATA } from '../utils/queries';
import { PageMenu } from '../utils/Utils';

const Role = () => {
    const { loading, data } = useQuery(GET_ROLES_DATA);
    return <div>test</div>;
};

export default Role;
