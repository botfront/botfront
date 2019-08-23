import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Breadcrumb } from 'semantic-ui-react';

class StoryPathPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderPath = () => {
        const { storyPath } = this.props;
        const pathArray = storyPath.split('__');
        let pathBreadcrumbs = [];

        pathArray.forEach((location, index) => {
            pathBreadcrumbs = [
                ...pathBreadcrumbs,
                <Breadcrumb.Section key={`popup-location-${index}`}>{location}</Breadcrumb.Section>,
                <Breadcrumb.Divider key={`popup-divider-${index}`}>{'>'}</Breadcrumb.Divider>,
            ];
        });
        pathBreadcrumbs.pop();
        return <ul className='story-path-popup'>{pathBreadcrumbs}</ul>;
    };

    renderContent = () => {
        const { storyPath } = this.props;
        return <div>{storyPath}</div>;
    }

    render () {
        const { trigger } = this.props;
        return (
            <Popup
                trigger={trigger}
                content={this.renderPath()}
                flowing
            />
        );
    }
}

StoryPathPopup.propTypes = {
    storyPath: PropTypes.string,
    trigger: PropTypes.element.isRequired,
};

StoryPathPopup.defaultProps = {
    storyPath: '',
};

export default StoryPathPopup;
