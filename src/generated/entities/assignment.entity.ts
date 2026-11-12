import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Assignment extends CustomTypeormEntityBase {
    static tableName = 'assignment';
    id = CustomTypeormFields.AutoPK({ db_column: 'id' });
    condition_back = CustomTypeormFields.CharacterString({
        db_column: 'condition_back',
    });
    returned_on = CustomTypeormFields.CharacterString({
        db_column: 'returned_on',
    });
    condition_out = CustomTypeormFields.CharacterString({
        db_column: 'condition_out',
    });
    assigned_on = CustomTypeormFields.CharacterString({
        db_column: 'assigned_on',
    });
    assignment_id = CustomTypeormFields.CharacterString({
        db_column: 'assignment_id',
    });
    notes = CustomTypeormFields.Text({ db_column: 'notes' });
    employee = CustomTypeormFields.FK({
        model_name: 'employee',
        db_column: 'employee',
    });
    asset = CustomTypeormFields.FK({ model_name: 'asset', db_column: 'asset' });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
