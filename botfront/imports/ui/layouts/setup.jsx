import React from 'react';
import PropTypes from 'prop-types';
import windowSize from 'react-window-size';
import DocumentTitle from 'react-document-title';
import { withTracker } from 'meteor/react-meteor-data';

// eslint-disable-next-line react/prefer-stateless-function
class SetupLayout extends React.Component {
    render() {
        const { children, windowHeight } = this.props;
        const loginBoxContainer = {
            paddingTop: `${windowHeight / 2 - 166}px`,
        };

        return (
            <div className='setup-layout' style={loginBoxContainer}>
                <DocumentTitle title='Botfront' />
                {children}
            </div>
        );
    }
}

SetupLayout.propTypes = {
    route: PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string,
    }).isRequired,
    windowHeight: PropTypes.number.isRequired,
    children: PropTypes.object.isRequired,
};

export default withTracker(() => ({}))(windowSize(SetupLayout));
