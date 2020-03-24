import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { withTracker } from 'meteor/react-meteor-data';

// eslint-disable-next-line react/prefer-stateless-function
class SetupLayout extends React.Component {
    render() {
        const { children } = this.props;
        const loginBoxContainer = {
            paddingTop: 'calc(50vh - 166px)',
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
    children: PropTypes.object.isRequired,
};

export default withTracker(() => ({}))(SetupLayout);
