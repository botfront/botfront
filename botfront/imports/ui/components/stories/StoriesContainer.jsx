import { Loader } from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';

import StoriesPageMenu from './StoriesPageMenu';

const Stories = React.lazy(() => import('./Stories'));

const StoriesContainer = (props) => {
    const { params } = props;
    return (
        <>
            <StoriesPageMenu projectId={params.project_id} />
            <React.Suspense fallback={<Loader />}>
                <Stories projectId={params.project_id} />
            </React.Suspense>
        </>
    );
};

StoriesContainer.propTypes = {
    params: PropTypes.object.isRequired,
};

export default StoriesContainer;
