import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from '../utils/Utils';

const ConnectHandoff = (props) => {
    const { params: { project_id: projectId = '' } = {}, router } = props;
    const { location: { query: queryParams } } = router;

    useEffect(() => {
        const { service, realm } = queryParams;
        Meteor.call('policies.connectHandoff', projectId, service, realm);
        router.replace(`/project/${projectId}/settings/integration`);
    }, []);
    return (
        <Loading loading />
    );
};

ConnectHandoff.propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
};

export default ConnectHandoff;
