import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

class StoryErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch() {
        // TODO: log error somewhere
    }

    render() {
        const { hasError } = this.state;
        if (hasError) {
            return (
                <div className='story-error-wrapper'>
                    <Message
                        icon='warning'
                        header='Sorry, something went wrong with the story'
                        content='Please try to refresh the page, if the problem persists, try editing the story in text mode.'
                        negative
                    />
                </div>
            );
        }

        const { children } = this.props;
        return children;
    }
}

StoryErrorBoundary.propTypes = {
    children: PropTypes.element.isRequired,
};

export default StoryErrorBoundary;
