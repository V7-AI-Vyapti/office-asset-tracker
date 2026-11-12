const GENERATED_CATALOG_RESOURCES = [
    { resource: 'asset', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'asset_csv_ingest', actions: ['run'] },
    { resource: 'assignment', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'assignment_csv_ingest', actions: ['run'] },
    { resource: 'counted_item', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'counted_item_csv_ingest', actions: ['run'] },
    { resource: 'employee', actions: ['create', 'delete', 'list', 'update', 'view'] },
    { resource: 'employee_csv_ingest', actions: ['run'] },
] as const;

export { GENERATED_CATALOG_RESOURCES };
