import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';

import './style.import.less';


class StoryPathPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderContent = () => {
        const { storyPath } = this.props;
        return <div>{storyPath}</div>;
    }

    render () {
        const { trigger } = this.props;
        return (
            <Popup
                trigger={trigger}
                content={this.renderContent()}
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
