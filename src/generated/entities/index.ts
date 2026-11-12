import { buildEntitySchema } from '@vyapti/core';
import { Asset } from './asset.entity';
import { Assignment } from './assignment.entity';
import { CountedItem } from './counted_item.entity';
import { Employee } from './employee.entity';

export const entitySchemas = [
    buildEntitySchema(Asset),
    buildEntitySchema(Assignment),
    buildEntitySchema(CountedItem),
    buildEntitySchema(Employee),
];
