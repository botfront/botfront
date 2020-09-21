import React, { useState, useEffect } from 'react';
import {
    Header, Button, Confirm, Message,
} from 'semantic-ui-react';
import { useMethod } from '../../utils/hooks.js';
import { can } from '../../../../lib/scopes';

const MigrationControl = () => {
    const { data: migrationDb, call: getMigrationStatus } = useMethod('settings.getMigrationStatus');
    const { call: unlockMigration } = useMethod('settings.unlockMigration');

    useEffect(() => {
        getMigrationStatus();
    }, []);

    const [LocalMigration, setLocalMigration] = useState(null);
    const [displayUnlockMessage, setDisplayUnlockMessage] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const migration = LocalMigration || migrationDb;
    return (
        <>
            {migration && can('global-admin') && (
            <>
                <Header>Migrations Control</Header>
                <p data-cy='migration-version'>Current version: {migration.version}</p>
                <p data-cy='migration-latest-version'>Latest version: {migration.latest}</p>
                <p data-cy='migration-status'>Status: {migration.locked ? 'Locked' : 'OK'}</p>
                {migration.locked && (
                    <>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setConfirmModalOpen(true);
                            }}
                            primary
                        >
                        Unlock Migration
                        </Button>
                        <Confirm
                            open={confirmModalOpen}
                            header='Unlock migration control'
                            content='Are you sure you want to proceed?'
                            onConfirm={() => {
                                unlockMigration();
                                setLocalMigration({ ...migration, locked: !migration.locked });
                                setDisplayUnlockMessage(true);
                            }}
                            onCancel={() => setConfirmModalOpen(false)}
                        />
                    </>
                )}
                {!migration.locked && displayUnlockMessage && (
                    <Message positive>
                        <Message.Header>Migration control unlocked</Message.Header>
                        Restart Botfront to resume migration.
                    </Message>
                )}
            </>
            )}
        </>
    );
};

MigrationControl.propTypes = {
};

export default MigrationControl;
