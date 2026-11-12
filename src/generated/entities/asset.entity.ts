import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Asset extends CustomTypeormEntityBase {
    static tableName = 'asset';
    asset_id = CustomTypeormFields.AutoPK({ db_column: 'asset_id' });
    condition = CustomTypeormFields.CharacterString({ db_column: 'condition' });
    warranty_until = CustomTypeormFields.CharacterString({
        db_column: 'warranty_until',
    });
    vendor = CustomTypeormFields.CharacterString({ db_column: 'vendor' });
    purchase_date = CustomTypeormFields.CharacterString({
        db_column: 'purchase_date',
    });
    serial_no = CustomTypeormFields.CharacterString({ db_column: 'serial_no' });
    model = CustomTypeormFields.CharacterString({ db_column: 'model' });
    brand = CustomTypeormFields.CharacterString({ db_column: 'brand' });
    tracking = CustomTypeormFields.CharacterString({ db_column: 'tracking' });
    category = CustomTypeormFields.CharacterString({ db_column: 'category' });
    type = CustomTypeormFields.CharacterString({ db_column: 'type' });
    asset_tag = CustomTypeormFields.CharacterString({ db_column: 'asset_tag' });
    status = CustomTypeormFields.CharacterString({ db_column: 'status' });
    location = CustomTypeormFields.CharacterString({ db_column: 'location' });
    price_inr = CustomTypeormFields.Integer({ db_column: 'price_inr' });
    current_holder = CustomTypeormFields.FK({
        model_name: 'employee',
        db_column: 'current_holder',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
