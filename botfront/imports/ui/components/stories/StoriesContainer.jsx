import React from 'react';
import StoriesPageMenu from './StoriesPageMenu';

const Stories = React.lazy(() => import('./Stories'));

const StoriesContainer = props => (
    <>
        <StoriesPageMenu projectId={props.params.project_id} />
        <React.Suspense fallback={null}><Stories projectId={props.params.project_id} /></React.Suspense>
    </>
);

export default StoriesContainer;
