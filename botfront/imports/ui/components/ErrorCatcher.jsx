import React from 'react';
import { Link } from 'react-router';
import { Container, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import CrashReportButton from './utils/CrashReportButton';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, reported: false };
    }

    isRootUrlError = () => {
        // eslint-disable-next-line no-undef
        const rootUrlRegex = new RegExp(__meteor_runtime_config__.ROOT_URL.replace(/(^\w+:|^)\/\//, ''));
        return !rootUrlRegex.test(window.location.href);
    }

    componentDidCatch(...error) {
        this.setState({ error });
    }

    renderError = () => {
        const { error, reported } = this.state;
        const {
            children: { props: { location: { pathname = '' } = {} } = {} } = {},
        } = this.props;
        if (this.isRootUrlError()) {
            /*
                Users commonly forget to setup the ROOT_URL environment variable which
                throws the "Failed to fetch" error.
                To assist users during setup and prevent unnecessary error reports provide
                the user with a infomative error screen.
            */
            return (
                <Container style={{
                    height: '100%', display: 'flex', alignItems: 'center',
                }}
                >
                    <div>
                        <Header
                            as='h1'
                            style={{ fontFamily: 'Hind, sans-serif', fontSize: '40px' }}
                        >
                            Please configure the ROOT_URL environment variable
                            <Header.Subheader style={{ marginTop: '10px' }}>
                                The ROOT_URL environment variable must be set to
                                the public URL where your instance of Botfront can be reached.
                            </Header.Subheader>
                        </Header>
                        <p>
                            For more information visit the{' '}
                            <a href='https://botfront.io/docs/installation/server-cluster#environment-variables'>
                                documentation
                            </a>
                        </p>
                    </div>
                </Container>
            );
        }
        return (
            <Container style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <div>
                    <Header
                        as='h1'
                        style={{ fontFamily: 'Hind, sans-serif', fontSize: '160px' }}
                    >
                        Oops!
                        <Header.Subheader style={{ marginTop: '10px' }}>
                            Something went wrong. Sorry about that.
                        </Header.Subheader>
                    </Header>
                    <p>
                        {reported
                            ? 'We\'re working on it!'
                            : 'Help the Botfront project by reporting the issue.'}
                    </p>
                    <p>
                        <CrashReportButton
                            pathname={pathname}
                            error={error}
                            reported={reported}
                            onLoad={rep => this.setState({ reported: rep })}
                        />
                    </p>
                    <Link to='/'>&#8617; home</Link>
                </div>
            </Container>
        );
    };

    render() {
        const { error } = this.state;
        const { children } = this.props;
        if (error) return this.renderError();
        return children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.any.isRequired,
};
