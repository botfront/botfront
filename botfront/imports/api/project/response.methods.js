import { intersectionBy, sortBy } from 'lodash';
import { check, Match } from 'meteor/check';
import { Projects } from './project.collection';

export const getTemplateLanguages = (templates) => {
    const langs = [];
    templates.forEach(t => t.values.forEach((v) => {
        if (langs.indexOf(v.lang) < 0) langs.push(v.lang);
    }));
    return sortBy(langs);
};


if (Meteor.isServer) {
    Meteor.methods({

        'templates.import'(projectId, templates) {
            check(projectId, String);
            check(templates, Match.OneOf(String, [Object]));

            const newTemplates = (typeof templates === 'string') ? JSON.parse(templates) : templates;
            const { templates: oldTemplates } = Projects.findOne({ _id: projectId }, { fields: { templates: 1 } });
            const pullTemplatesKey = intersectionBy(oldTemplates, newTemplates, 'key').map(({ key }) => key);

            try {
                Projects.update({ _id: projectId }, { $pull: { templates: { key: { $in: pullTemplatesKey } } } });
                Projects.update(
                    { _id: projectId },
                    { $push: { templates: { $each: newTemplates } }, $set: { responsesUpdatedAt: Date.now() } },
                );
            } catch (e) {
                throw new Meteor.Error(e);
            }
        },

        'templates.countWithIntent'(projectId, intent) {
            check(projectId, String);
            check(intent, String);

            const project = Projects.find(
                { _id: projectId },
                {
                    fields: {
                        templates: {
                            $elemMatch: {
                                'match.nlu.intent': intent,
                            },
                        },
                    },
                },
            ).fetch();

            return !!project[0].templates;
        },
    });
}
