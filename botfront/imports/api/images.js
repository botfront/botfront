import SimpleSchema from 'simpl-schema';
import uuidv4 from 'uuid/v4';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan } from '../lib/scopes';
import { Projects } from './project/project.collection';
import { formatError } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';

export const ImageStore = new Mongo.Collection('images');
// Deny all client-side updates on the ImageStore collection
ImageStore.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

const ImageSchema = new SimpleSchema({
    _id: String,
    projectId: String,
    bucketName: String,
    fileName: String,
    url: String,
    counter: Number,
});

ImageStore.attachSchema(ImageSchema);

function removeFromGCS(imageId) {
    try {
        const { bucketName, fileName } = ImageStore.findOne({ _id: imageId });
        // eslint-disable-next-line global-require
        const { Storage } = require('@google-cloud/storage');
        const { settings: { private: { gcpProjectId: projectId } } } = GlobalSettings.findOne({}, { fields: { 'settings.private.gcpProjectId': 1 } });
        const storage = new Storage({
            projectId,
        });

        return Promise.await(storage.bucket(bucketName).file(fileName).delete());
    } catch (e) {
        throw formatError(e);
    }
}

function checkImageRights(projectId) {
    checkIfCan('project-admin', projectId);
}

export function useImage(imageId) {
    try {
        const image = ImageStore.findOne({ _id: imageId });

        image.counter += 1;
        ImageStore.update({ _id: imageId }, { $set: image });
    } catch (e) {
        throw formatError(e);
    }
}

export function removeImage(imageId) {
    try {
        const image = ImageStore.findOne({ _id: imageId });
        image.counter -= 1;
        if (image.counter === 0) {
            removeFromGCS(imageId);
            ImageStore.remove({ _id: imageId });
        } else {
            ImageStore.update({ _id: imageId }, { $set: image });
        }
    } catch (e) {
        throw formatError(e);
    }
}

if (Meteor.isServer) {
    Meteor.publish('images', function(projectId) {
        check(projectId, String);

        try {
            checkIfCan('project-admin', projectId, this.userId);
            return ImageStore.find({ projectId });
        } catch (e) {
            return [];
        }
    });

    Meteor.methods({
        'images.uploadToGCS'(fileBinaryString, projectId, imageId, extension) {
            check(projectId, String);
            checkIfCan('project-admin', projectId);
            check(fileBinaryString, String);
            check(imageId, String);
            check(extension, String);
            checkImageRights(projectId);
            this.unblock();

            try {
                let bucketLabel = 'global';
                if (projectId !== 'global') {
                    const { namespace } = Projects.findOne({ _id: projectId });
                    bucketLabel = namespace;
                }

                const fileName = `image-${imageId}.${extension}`;
                const bucketName = `bf-media-${bucketLabel}`;

                // eslint-disable-next-line global-require
                const { Storage } = require('@google-cloud/storage');
                const { settings: { private: { gcpProjectId } } } = GlobalSettings.findOne({}, { fields: { 'settings.private.gcpProjectId': 1 } });
                const storage = new Storage({
                    projectId: gcpProjectId,
                });
        
                const bucketCreated = new Promise((resolve, reject) => {
                    storage.bucket(bucketName).exists((error, result) => {
                        if (!error) {
                            if (result) {
                                resolve(true);
                            } else {
                                storage.createBucket(bucketName).then(resolve).catch(reject);
                            }
                        } else {
                            reject(error);
                        }
                    });
                });

                Promise.await(bucketCreated.then(() => new Promise((resolve, reject) => {
                    Meteor.call('upload.gcs', fileBinaryString, projectId, bucketName, fileName, { makePublic: true }, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                })));

                return { url: `https://storage.googleapis.com/${bucketName}/${fileName}`, bucketName, fileName };
            } catch (e) {
                throw formatError(e);
            }
        },

        'images.addImage'(fileBinaryString, projectId, extension) {
            check(projectId, String);
            checkIfCan('project-admin', projectId);
            check(fileBinaryString, String);
            check(extension, String);
            checkImageRights(projectId);
            this.unblock();

            try {
                const imageId = uuidv4();
                const { url, bucketName, fileName } = Meteor.call('images.uploadToGCS', fileBinaryString, projectId, imageId, extension);

                ImageStore.insert({
                    _id: imageId, url, bucketName, fileName, projectId, counter: 1,
                });
                return { url, imageId };
            } catch (e) {
                throw formatError(e);
            }
        },

        'images.updateImage'(fileBinaryString, projectId, imageId, extension) {
            check(projectId, String);
            checkIfCan('project-admin', projectId);
            check(fileBinaryString, String);
            check(imageId, String);
            check(extension, String);
            checkImageRights(projectId);
            this.unblock();

            try {
                removeImage(imageId);
                return Meteor.call('images.addImage', fileBinaryString, projectId, extension);
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
