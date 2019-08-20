import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Breadcrumb } from 'semantic-ui-react';

import './style.import.less';

import StoryPathPopup from './StoryPathPopup.jsx';

class StoryFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderPath = () => {
        const { storyPath } = this.props;
        let pathArray = storyPath.split('__');
        const pathBreadcrumbs = [];
        const maxLength = 3;

        if (pathArray.length > 3) {
            pathBreadcrumbs.push();
            pathArray = pathArray.slice(pathArray.length - maxLength, pathArray.length);
            pathBreadcrumbs.push(
                <StoryPathPopup
                    storyPath={storyPath}
                    trigger={<Breadcrumb.Section className='collapsed-path'>...</Breadcrumb.Section>}
                />,
            );
            pathBreadcrumbs.push(<Breadcrumb.Divider>{'>'}</Breadcrumb.Divider>);
        }
        pathArray.forEach((location) => {
            pathBreadcrumbs.push(<Breadcrumb.Section>{location}</Breadcrumb.Section>);
            pathBreadcrumbs.push(<Breadcrumb.Divider>{'>'}</Breadcrumb.Divider>);
        });
        pathBreadcrumbs.pop();
        return pathBreadcrumbs;
    };

    render () {
        return (
            <Segment className='breadcrumb-container' attatched='bottom'>{this.renderPath()}</Segment>
        );
    }
}

StoryFooter.propTypes = {
    storyPath: PropTypes.string,
    canBranch: PropTypes.bool,
    canContinue: PropTypes.bool,
    onBranch: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
};

StoryFooter.defaultProps = {
    storyPath: '',
    canBranch: true,
    canContinue: true,
};

export default StoryFooter;
