import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

const { version } = require('/package.json');

const CrashReportButton = (props) => {
    const { error, pathname } = props;
    const [reported, setReported] = useState(false);

    const generateReport = () => {
        const [err, info] = error;
        const report = (
            `Version: ${version}\n`
            + `${pathname ? `Path: ${pathname}\n` : ''}`
            + `Trace: ${err.toString()}`
            + `${info.componentStack || ''}`
        );
        return report;
    };

    useEffect(() => Meteor.call('reportCrash', generateReport(), (_, res) => {
        if (res.reported) setReported(res.reported);
    }), []);

    const copyToClipboard = () => {
        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = generateReport();
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
    };

    if (reported) return null;
    return (
        <Button
            content='Copy crash report to clipboard'
            color='red'
            basic
            fluid
            onClick={copyToClipboard}
        />
    );
};

CrashReportButton.propTypes = {
    error: PropTypes.array.isRequired,
    pathname: PropTypes.string,
};

CrashReportButton.defaultProps = {
    pathname: null,
};

export default CrashReportButton;
