export const extractEntities = (examples) => {
    const entities = [];
    examples.forEach((e) => {
        if (e.entities) {
            e.entities.forEach((ent) => {
                if (entities.indexOf(ent.entity) === -1) {
                    entities.push(ent.entity);
                }
            });
        }
    });
    return entities;
};
