const assert = require('assert');
const isMinorUpdateWithVersion = require('../src/utils').isMinorUpdateWithVersion;
const isMajorUpdateWithVersion = require('../src/utils').isMajorUpdateWithVersion;
const shouldUpdateNpmPackageWithVersions = require('../src/utils').shouldUpdateNpmPackageWithVersions;

/* Test */
describe('Project update', () => {
    it('should propose minor project update if minor version update', function(done){
        const shouldUpdate = isMinorUpdateWithVersion('0.18.5', '0.18.6');
        assert.equal(shouldUpdate, true);
        done();
    });

    it('should not propose minor project update if major version update', function(done){
        const shouldUpdate = isMinorUpdateWithVersion('0.18.5', '0.19.6');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should not propose project update if same versions', function(done){
        const shouldUpdate = isMinorUpdateWithVersion('0.18.5', '0.19.6');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should not propose project update if older versions', function(done){
        const shouldUpdate = isMinorUpdateWithVersion('0.18.5', '0.19.6');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should propose major project update if major version update', function(done){
        const shouldUpdate = isMajorUpdateWithVersion('0.18.5', '0.19.6');
        assert.equal(shouldUpdate, true);
        done();
    });

    it('should not propose major project update if minor version update', function(done){
        const shouldUpdate = isMajorUpdateWithVersion('0.18.5', '0.18.6');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should not propose major project update if lower minor version', function(done){
        const shouldUpdate = isMajorUpdateWithVersion('0.18.5', '0.18.4');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should not propose major project update if lower major version', function(done){
        const shouldUpdate = isMajorUpdateWithVersion('0.18.5', '0.16.4');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('should not propose major project update if same version', function(done){
        const shouldUpdate = isMajorUpdateWithVersion('0.18.5', '0.18.5');
        assert.equal(shouldUpdate, false);
        done();
    });
});

describe('NPM package update', () => {
    it('should display NPM project update message if newer minor version', function(done){
        const shouldUpdate = shouldUpdateNpmPackageWithVersions('0.18.5', '0.18.6');
        assert.equal(shouldUpdate, true);
        done();
    });

    it('should display NPM project update message if newer major version', function(done){
        const shouldUpdate = shouldUpdateNpmPackageWithVersions('0.18.5', '0.19.6');
        assert.equal(shouldUpdate, true);
        done();
    });

    it('should display NPM project update message if newer major version', function(done){
        const shouldUpdate = shouldUpdateNpmPackageWithVersions('0.18.5', '0.19.0-beta.0');
        assert.equal(shouldUpdate, true);
        done();
    });

    it('should not display NPM project update message if older version', function(done){
        const shouldUpdate = shouldUpdateNpmPackageWithVersions('0.18.5', '0.18.4');
        assert.equal(shouldUpdate, false);
        done();
    });

    it('hould not display NPM project update message if same versions', function(done){
        const shouldUpdate = shouldUpdateNpmPackageWithVersions('0.18.5', '0.18.5');
        assert.equal(shouldUpdate, false);
        done();
    });
});