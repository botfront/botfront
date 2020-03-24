import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { withTracker } from 'meteor/react-meteor-data';
import { Header } from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { getBackgroundImageUrl } from '../../lib/utils';
import { GlobalSettings } from '../../api/globalSettings/globalSettings.collection';

// eslint-disable-next-line react/prefer-stateless-function
class AccountLayout extends React.Component {
    render() {
        const {
            route: { name },
            children,
        } = this.props;

        const bgStyle = {
            height: '101vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
        
        const backgroundUrl = getBackgroundImageUrl();
        
        if (backgroundUrl) bgStyle.backgroundImage = `url(${backgroundUrl})`;

        const titleStyle = {
            fontFamily: '\'Hind\', sans-serif',
            opacity: '25%',
            paddingTop: '20px',
            paddingLeft: '15px',
            fontSize: '2.5em',
            color: 'white',
        };

        const loginBoxContainer = {
            marginTop: 'calc(50vh - 166px)',
            width: '332px',
            marginLeft: 'calc(50vw - 166px)',
        };

        return (
            <div style={bgStyle} className='setup'>
                <Header style={titleStyle} content='Botfront.' />
                <div style={{ textAlign: 'center' }}>
                    <DocumentTitle title={name || 'Botfront'} />
                    <div style={loginBoxContainer}>{children}</div>
                </div>
                <Alert stack={{ limit: 3 }} />
            </div>
        );
    }
}

AccountLayout.propTypes = {
    route: PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string,
    }).isRequired,
    children: PropTypes.object.isRequired,
};


const AccountLayoutContainer = withTracker(() => {
    Meteor.subscribe('settings');
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.reCatpchaSiteKey': 1, 'settings.public.backgroundImages': 1 } });
    return {
        settings,
    };
})(AccountLayout);
export default AccountLayoutContainer;
