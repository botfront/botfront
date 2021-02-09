export const validateEventFilters = (filters, operator) => {
    let errors = [];
    if (filters && operator) {
        const intentsAndAction = filters;
        if (operator === 'inOrder') {
            let isNewSequenceValid = true;
            let previousExcluded = false;
            intentsAndAction.forEach((step) => {
                if (previousExcluded && step.excluded) isNewSequenceValid = false;
                previousExcluded = step.excluded;
            });
            if (!isNewSequenceValid) errors.push('You cannot have two exclusion next to each other when using in order');
            if (intentsAndAction.length > 0 && intentsAndAction[0].excluded) errors.push('You cannot start with an exclusion when using in order');
        } else {
            const uniq = intentsAndAction
                .map(elm => ({
                    count: 1,
                    name: elm.name,
                }))
                .reduce((a, b) => {
                    // eslint-disable-next-line no-param-reassign
                    a[b.name] = (a[b.name] || 0) + b.count;
                    return a;
                }, {});
        
            const duplicates = Object.keys(uniq).filter(a => uniq[a] > 1);
            if (duplicates.length > 0) {
                errors = errors.concat(duplicates.map(elm => `${elm} is duplicated`));
            }
        }
    }
    return errors;
};
