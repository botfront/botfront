/* eslint-disable react/prop-types */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import Alert from 'react-s-alert';
import AdminSidebar from '../components/admin/Sidebar';

export default class AdminLayout extends React.Component {
    componentDidMount() {
        const { location } = this.props;
        if (location.state && location.state.error) {
            Alert.error(location.state.error, {
                position: 'top',
                timeout: 4000,
            });
        }
    }

    handleLogout = () => {
        Meteor.logout(() => {
            const { router } = this.props;
            router.push('/');
        });
    };

    render() {
        const { children } = this.props;
        const style = {
            height: '100vh',
        };
        const menuStyle = {
            width: '250px',
            background: '#1b1c1d',
        };

        const contentStyle = {
            marginLeft: '190px',
            minWidth: '550px',
        };
        return (
            <div style={style}>
                <div style={menuStyle}>
                    <AdminSidebar handleLogout={this.handleLogout} />
                </div>
                <div style={contentStyle}>{children}</div>
                <Alert stack={{ limit: 3 }} />
            </div>
        );
    }
}
