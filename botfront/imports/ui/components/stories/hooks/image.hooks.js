/* eslint-disable no-console */

import { useContext } from 'react';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';
import { ProjectContext } from '../../../layouts/context';

export function useUpload(templateKey) {
    const { language, project: { _id: projectId }, webhooks } = useContext(ProjectContext);
    const { uploadImageWebhook: { url, method } } = webhooks;
    const reader = new FileReader();

    const uploadImage = async ({
        file, setImage, resetUploadStatus,
    }) => {
        try {
            reader.readAsBinaryString(file);
            reader.onload = () => {
                const fileData = btoa(reader.result);
                const data = {
                    projectId, data: fileData, mimeType: file.type, language, responseId: `${templateKey}_${new Date().getTime()}`,
                };
                Meteor.call('axios.requestWithJsonBody', url, method, data, (err, response) => {
                    if (err || response.status !== 200) {
                        Alert.error(`Error ${err || response.status} while trying to upload image : ${response.data || ''} `, {
                            position: 'top-right',
                            timeout: 2000,
                        });
                    }
                    if (response.status === 200) setImage(response.data.uri);
                    resetUploadStatus();
                });
            };
        } catch (e) {
            console.log('error while uploading the image, check botfront logs');
            resetUploadStatus();
        }
    };
    if (templateKey && webhooks && language && projectId && reader) return [uploadImage];
    return [() => {}];
}
