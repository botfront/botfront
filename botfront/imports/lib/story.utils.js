export const traverseStory = (story, path) => path
    .split('__')
    .slice(1)
    // gets branches but also indices, useful for setting later
    .reduce(
        (accumulateur, value) => {
            const index = accumulateur.branches.findIndex(
                branch => branch._id === value,
            );
            return {
                branches: accumulateur.branches[index].branches ? [...accumulateur.branches[index].branches] : [],
                story: accumulateur.branches[index].story,
                title: accumulateur.branches[index].title,
                // Indices are the path in numeric form, for instance, the second branch into the first branch
                // would hae the indices looking like [0, 1], so first branch then second branch.
                indices: [...accumulateur.indices, index],
                path: `${accumulateur.path}__${ // the path as a double__underscore-separated string of IDs
                    accumulateur.branches[index]._id
                }`,
                pathTitle: `${accumulateur.pathTitle}__${ // the path as a double__underscore-separated string of titles
                    accumulateur.branches[index].title
                }`,
            };
        },
        {
            branches: story.branches ? [...story.branches] : [],
            story,
            title: story.title,
            indices: [],
            path: story._id,
            pathTitle: story.title,
        },
    );
