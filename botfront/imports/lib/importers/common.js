import JSZIP from 'jszip';
import yaml from 'js-yaml';

export const onlyValidFiles = files => files.filter(file => !(file.errors && file.errors.length > 0));

export const determineDataType = (f, rawText) => {
    const { dataType, filename } = f;
    try {
        if (dataType) return dataType;
        if (/^default-domain((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'defaultdomain';
        if (/^bfconfig((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'bfconfig';
        if (/^domain((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'domain';
        if (/^config((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'rasaconfig';
        if (/^endpoints((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'endpoints';
        if (/^credentials((\.|-)[a-z]+)?\.ya?ml$/.test(filename)) return 'credentials';
        if (/^widgetsettings\.ya?ml$/.test(filename)) return 'widgetsettings';
        if (filename.match(/^conversations?((\.|-)[a-z]+)?\.json$/)) return 'conversations';
        if (filename.match(/^formresults((\.|-)[a-z]+)?\.json$/)) return 'formresults';
        if (filename.match(/^incoming((\.|-)[a-z]+)?\.json$/)) return 'incoming';
        if (filename.match(/\.json$/)) {
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                return 'unknown';
            }
            if (Array.isArray(data)) {
                // might need improving at some point
                if (!data.length) return 'empty';
                if (data[0].tracker) return 'conversations';
                if (data[0].text) return 'incoming';
            } else if (Object.keys(data).length > 0) {
                return 'training_data';
            }
            if (typeof data === 'object' && Object.keys(data).length === 0) return 'empty';
            return 'training_data';
        }
        if (filename.match(/^analyticsconfig.ya?ml$/)) return 'analytics';
        if (filename.match(/\.ya?ml$/)) {
            let data;
            try {
                data = yaml.safeLoad(rawText);
            } catch (e) {
                return 'unknown';
            }
            const domainKeys = [
                'responses',
                'templates',
                'actions',
                'session_config',
                'slots',
            ];
            const trainingKeys = ['nlu', 'stories', 'rules'];
            if (Object.keys(data).some(key => domainKeys.includes(key))) {
                return 'domain';
            }
            if (Object.keys(data).some(key => trainingKeys.includes(key))) {
                return 'training_data';
            }
            if (typeof data === 'object' && data.cards && data.cards.length > 0) return 'analytics';
        }
        if (filename.match(/\.md$/)) {
            return 'training_data';
        }
        return 'unknown';
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
        return 'unknown';
    }
};

export const unZipFile = async (f) => {
    const zip = new JSZIP();
    const loadedZip = await zip.loadAsync(f);
    const files = await Promise.all(
        Object.keys(loadedZip.files).map(async (filename) => {
            const fileData = await loadedZip.files[filename].async('blob');
            if (/([a-z-0-9]+\/)+$/.test(filename)) {
                // this regex detect folder in the shape of aa/bbb/
                return null; // we don't want folders in the file array
            }
            return new File([fileData], filename.replace(/([a-z-0-9]+\/)+/, '')); // keep only the name of the file ditch the path part
        }),
    );
    return files.filter(file => file !== null);
};
