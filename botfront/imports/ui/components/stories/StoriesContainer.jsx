import { Loader } from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { WithRefreshOnLoad } from '../../layouts/project';

import StoriesPageMenu from './StoriesPageMenu';

const Stories = React.lazy(() => import('./Stories'));

const StoriesContainer = (props) => {
    const { params, onLoad } = props;
    React.useEffect(() => onLoad(), []);
    return (
        <>
            <StoriesPageMenu projectId={params.project_id} />
            <React.Suspense fallback={<Loader />}>
                <DndProvider backend={HTML5Backend}>
                    <Stories projectId={params.project_id} />
                </DndProvider>
            </React.Suspense>
        </>
    );
};

StoriesContainer.propTypes = {
    params: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
};

export default WithRefreshOnLoad(StoriesContainer);
