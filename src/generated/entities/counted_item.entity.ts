import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class CountedItem extends CustomTypeormEntityBase {
    static tableName = 'counted_item';
    counted_item_id = CustomTypeormFields.AutoPK({
        db_column: 'counted_item_id',
    });
    item_code = CustomTypeormFields.CharacterString({ db_column: 'item_code' });
    category = CustomTypeormFields.CharacterString({ db_column: 'category' });
    location = CustomTypeormFields.CharacterString({ db_column: 'location' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    qty_in_use = CustomTypeormFields.Integer({ db_column: 'qty_in_use' });
    qty_total = CustomTypeormFields.Integer({ db_column: 'qty_total' });
    unit_price_inr = CustomTypeormFields.Integer({
        db_column: 'unit_price_inr',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
