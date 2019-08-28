import { expect, assert } from 'chai';
import {
    traverseStory,
    appendBranchCheckpoints,
    flattenStory,
} from './story.utils';

const storyFixture = {
    _id: 'n6ArDvmf7PEBrZ4ph',
    title: 'MyRootStory',
    projectId: 'TZjfxMi4jHALBQ5s4',
    storyGroupId: 'vWibRMnEe6B6nSWMm',
    branches: [
        {
            title: 'MyLevel1Branch1',
            branches: [],
            _id: 'u8fUQytlr',
            story: 'I\'m at level one',
        },
        {
            title: 'MyLevel1Branch2',
            branches: [
                {
                    title: 'MyLevel2Branch1',
                    branches: [],
                    _id: 'VAcNydTIc',
                    story: 'I\'m at level two',
                },
                {
                    title: 'MyLevel2Branch2',
                    branches: [
                        {
                            title: 'MyLevel3Branch1',
                            branches: [],
                            _id: 'IDY6KreSH',
                            story: 'I\'m at level three',
                        },
                        {
                            title: 'MyLevel3Branch2',
                            branches: [],
                            _id: 'H8JQsW2Wi-',
                            story: 'I\'m at level three',
                        },
                        {
                            title: 'MyLevel3Branch3',
                            branches: [],
                            _id: 'vWGn8wdnA',
                            story: 'I\'m at level three',
                        },
                    ],
                    _id: 'pH8WSjPsYv',
                    story: 'I\'m at level two',
                },
                {
                    title: 'MyLevel2Branch3',
                    branches: [],
                    _id: 'hR5bnFzb3',
                    story: 'I\'m at level two',
                },
            ],
            _id: '3jFsC86Oaz',
            story: 'I\'m at level one',
        },
        {
            title: 'MyLevel1Branch3',
            branches: [],
            _id: 'SRxr9Ebjc',
            story: 'I\'m at level one',
        },
    ],
    story: 'I\'m at the root level',
};

const checkpointedStory = {
    _id: 'n6ArDvmf7PEBrZ4ph',
    title: 'MyRootStory',
    projectId: 'TZjfxMi4jHALBQ5s4',
    storyGroupId: 'vWibRMnEe6B6nSWMm',
    branches: [
        {
            title: 'MyRootStory__MyLevel1Branch1',
            branches: [],
            _id: 'u8fUQytlr',
            story: '> MyRootStory__branches\nI\'m at level one',
        },
        {
            title: 'MyRootStory__MyLevel1Branch2',
            branches: [
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch1',
                    branches: [],
                    _id: 'VAcNydTIc',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two',
                },
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2',
                    branches: [
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch1',
                            branches: [],
                            _id: 'IDY6KreSH',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch2',
                            branches: [],
                            _id: 'H8JQsW2Wi-',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch3',
                            branches: [],
                            _id: 'vWGn8wdnA',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                    ],
                    _id: 'pH8WSjPsYv',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two\n> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
                },
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch3',
                    branches: [],
                    _id: 'hR5bnFzb3',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two',
                },
            ],
            _id: '3jFsC86Oaz',
            story: '> MyRootStory__branches\nI\'m at level one\n> MyRootStory__MyLevel1Branch2__branches',
        },
        {
            title: 'MyRootStory__MyLevel1Branch3',
            branches: [],
            _id: 'SRxr9Ebjc',
            story: '> MyRootStory__branches\nI\'m at level one',
        },
    ],
    story: 'I\'m at the root level\n> MyRootStory__branches',
};

const flattenedStory = [
    { story: 'I\'m at the root level\n> MyRootStory__branches', title: 'MyRootStory' },
    { story: '> MyRootStory__branches\nI\'m at level one', title: 'MyRootStory__MyLevel1Branch1' },
    { story: '> MyRootStory__branches\nI\'m at level one\n> MyRootStory__MyLevel1Branch2__branches', title: 'MyRootStory__MyLevel1Branch2' },
    { story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch1' },
    { story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two\n> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2' },
    { story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch1' },
    { story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch2' },
    { story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch3' },
    { story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two', title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch3' },
    { story: '> MyRootStory__branches\nI\'m at level one', title: 'MyRootStory__MyLevel1Branch3' },
];

describe('proper traversal of story', function() {
    it('should resolve an existing path', function() {
        const {
            branches, story, title, indices, path, pathTitle,
        } = traverseStory(storyFixture, 'n6ArDvmf7PEBrZ4ph__3jFsC86Oaz__pH8WSjPsYv');
        expect(branches).to.be.deep.equal(storyFixture.branches[1].branches[1].branches);
        expect(story).to.be.equal('I\'m at level two');
        expect(title).to.be.equal('MyLevel2Branch2');
        expect(indices).to.be.deep.equal([1, 1]);
        expect(path).to.be.equal('n6ArDvmf7PEBrZ4ph__3jFsC86Oaz__pH8WSjPsYv');
        expect(pathTitle).to.be.equal('MyRootStory__MyLevel1Branch2__MyLevel2Branch2');
    });
    it('should throw an error when encountering non-existing path', function() {
        const traverseFakePath = () => traverseStory(storyFixture, 'n6ArDvmf7PEBrZ4ph__a__fake__path');
        assert.throws(traverseFakePath, Error, 'Could not access n6ArDvmf7PEBrZ4ph__a');
    });
});

describe('proper appending of checkpoints to branching story', function() {
    it('should output something matching the gold', function() {
        expect(appendBranchCheckpoints(storyFixture)).to.be.deep.equal(checkpointedStory);
    });
});

describe('proper flattening of stories', function() {
    it('should output something matching the gold', function() {
        expect(flattenStory(checkpointedStory)).to.be.deep.equal(flattenedStory);
    });
});
