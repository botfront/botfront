/* eslint-disable no-constant-condition */
/* eslint-disable import/first */

if (false) {
    import('../api/globalSettings/globalSettings.schema.docker-compose');
    import('../api/globalSettings/globalSettings.schema.default');
    import('../api/project/project.schema.default');
    import('../ui/components/admin/settings/Settings.docker-compose');
    import('../api/endpoints/endpoints.docker-compose');
    import('../api/instances/instances.docker-compose');
}

// ee-start //
if (false) {
    import('../api/globalSettings/globalSettings.schema.gke');
    import('../api/project/project.schema.gke.js');
    import('../ui/components/settings/gke/Settings.gke');
    import('../ui/components/admin/settings/Settings.gke');
    import('../api/endpoints/endpoints.gke');
    import('../api/deployment/deployment.gke');
    import('../api/instances/instances.gke');
    import('../api/roles/roles.ee');
}
// ee-end //
