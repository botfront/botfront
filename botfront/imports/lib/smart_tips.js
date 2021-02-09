import moment from 'moment';
import { union } from 'lodash';

const roundPercent = num => (num * 100).toFixed(2);

const smartTips = (flags) => {
    let code;
    let message;
    let tip;
    let extraEntities = [];
    const {
        outdated, intentBelowTh, entitiesBelowTh, entitiesInTD, aboveTh,
    } = flags;
    if (outdated) {
        tip = 'Utterance outdated';
        message = 'Model has been trained since this utterance was logged. It needs to be reinterpreted.';
        code = 'outdated';
    }
    if (intentBelowTh) {
        tip = 'Low confidence';
        code = 'intentBelowTh';
        message = intentBelowTh.confidence > 0
            ? `Intent *${intentBelowTh.name}* was predicted with confidence ${roundPercent(intentBelowTh.confidence)}, which is below your set threshold.`
            : 'You have made some changes to the labeling.';
    }
    if (entitiesBelowTh) {
        tip = 'Low confidence';
        code = 'entitiesBelowTh';
        const plural = entitiesBelowTh.length > 1;
        const entityNames = entitiesBelowTh.map(entity => `*${entity.name}*`);
        const entityConf = entitiesBelowTh.map(entity => roundPercent(entity.confidence));
        message = entityConf.every(conf => conf > 0)
            ? `Entit${plural ? 'ies' : 'y'} ${entityNames.join(', ')} ${plural ? 'were' : 'was'} predicted
                with confidence ${entityConf.join(', ')}, which is below your set threshold.`
            : 'You have made some changes to the labeling.';
    }
    if (entitiesInTD) {
        tip = 'High confidence, but...';
        code = 'entitiesInTD';
        extraEntities = entitiesInTD;
        const plural = entitiesInTD.length > 1;
        message = `First verify entit${plural ? 'ies' : 'y'} ${entitiesInTD.map(e => `*${e}*`).join(', ')} ${plural ? 'are' : 'is'} not present in this utterance. 
        If not, you can delete it, as your model will likely not learn from it.`;
    }
    if (aboveTh) {
        tip = 'High confidence';
        code = 'aboveTh';
        const { intent, entities } = aboveTh;
        if (entities.length > 0) {
            const plural = entities > 1;
            const entityNames = entities.map(entity => `*${entity.name}*`);
            message = `Intent *${intent.name}* and entit${plural ? 'ies' : 'y'} ${entityNames.join(', ')} were predicted
            with sufficient confidence. You can delete this utterance, as your model will likely not learn from it.`;
        } else {
            message = `Intent *${intent.name}* was predicted with a confidence level above your set threshold. We recommend you delete this kind of utterance.`;
        }
    }

    return {
        tip, code, message, extraEntities,
    };
};

const isUtteranceOutdated = (endTime, { updatedAt }) => moment(updatedAt).isBefore(moment(endTime));

const getSimilarTD = (examples, utterance) => {
    const utteranceEntities = utterance.entities ? utterance.entities.map(entity => entity.entity) : [];
    return examples
        .filter((example) => {
            if (example.intent !== utterance.intent) return false;
            const exEntities = example.entities ? example.entities.map(entity => entity.entity) : [];
            return (utteranceEntities.every(entity => exEntities.includes(entity))
                && exEntities.some(entity => !utteranceEntities.includes(entity)));
        });
};

export const getSmartTips = ({
    nluThreshold: th, endTime, examples, utterance,
}) => {
    if (isUtteranceOutdated(endTime, utterance)) return smartTips({ outdated: true });

    const intentBelowTh = utterance.confidence < th ? { name: utterance.intent, confidence: utterance.confidence } : null;
    if (intentBelowTh) return smartTips({ intentBelowTh });

    const entitiesBelowTh = utterance.entities.filter(entity => entity.confidence < th)
        .map(entity => ({ name: entity.entity, confidence: entity.confidence }));
    if (entitiesBelowTh.length) return smartTips({ entitiesBelowTh });

    const entitiesInUt = utterance.entities.map(entity => entity.entity);
    const entitiesInTD = union(
        ...getSimilarTD(examples, utterance)
            .map(td => td.entities.map(entity => entity.entity)),
    ).filter(entity => !entitiesInUt.includes(entity));
    if (entitiesInTD.length) return smartTips({ entitiesInTD });

    return smartTips({
        aboveTh: {
            intent: { name: utterance.intent },
            entities: utterance.entities.map(entity => ({ name: entity.entity })),
        },
    });
};
