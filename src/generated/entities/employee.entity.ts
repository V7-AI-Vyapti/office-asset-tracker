import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Employee extends CustomTypeormEntityBase {
    static tableName = 'employee';
    id = CustomTypeormFields.AutoPK({ db_column: 'id' });
    left_on = CustomTypeormFields.CharacterString({ db_column: 'left_on' });
    joined_on = CustomTypeormFields.CharacterString({ db_column: 'joined_on' });
    status = CustomTypeormFields.CharacterString({ db_column: 'status' });
    location = CustomTypeormFields.CharacterString({ db_column: 'location' });
    department = CustomTypeormFields.CharacterString({
        db_column: 'department',
    });
    email = CustomTypeormFields.CharacterString({ db_column: 'email' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    employee_id = CustomTypeormFields.CharacterString({
        db_column: 'employee_id',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
