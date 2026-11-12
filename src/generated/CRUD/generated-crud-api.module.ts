import { Module } from '@nestjs/common';
import {
    CreateAssetController,
    CreateAssetService,
} from '@generated-crud/asset/create_asset.api';
import {
    CreateAssignmentController,
    CreateAssignmentService,
} from '@generated-crud/assignment/create_assignment.api';
import {
    CreateCountedItemController,
    CreateCountedItemService,
} from '@generated-crud/counted_item/create_counted_item.api';
import {
    CreateEmployeeController,
    CreateEmployeeService,
} from '@generated-crud/employee/create_employee.api';
import {
    DeleteAssetController,
    DeleteAssetService,
} from '@generated-crud/asset/delete_asset.api';
import {
    DeleteAssignmentController,
    DeleteAssignmentService,
} from '@generated-crud/assignment/delete_assignment.api';
import {
    DeleteCountedItemController,
    DeleteCountedItemService,
} from '@generated-crud/counted_item/delete_counted_item.api';
import {
    DeleteEmployeeController,
    DeleteEmployeeService,
} from '@generated-crud/employee/delete_employee.api';
import {
    ListAssetController,
    ListAssetService,
} from '@generated-crud/asset/list_asset.api';
import {
    ListAssignmentController,
    ListAssignmentService,
} from '@generated-crud/assignment/list_assignment.api';
import {
    ListCountedItemController,
    ListCountedItemService,
} from '@generated-crud/counted_item/list_counted_item.api';
import {
    ListEmployeeController,
    ListEmployeeService,
} from '@generated-crud/employee/list_employee.api';
import {
    UpdateAssetController,
    UpdateAssetService,
} from '@generated-crud/asset/update_asset.api';
import {
    UpdateAssignmentController,
    UpdateAssignmentService,
} from '@generated-crud/assignment/update_assignment.api';
import {
    UpdateCountedItemController,
    UpdateCountedItemService,
} from '@generated-crud/counted_item/update_counted_item.api';
import {
    UpdateEmployeeController,
    UpdateEmployeeService,
} from '@generated-crud/employee/update_employee.api';
import {
    ViewAssetController,
    ViewAssetService,
} from '@generated-crud/asset/view_asset.api';
import {
    ViewAssignmentController,
    ViewAssignmentService,
} from '@generated-crud/assignment/view_assignment.api';
import {
    ViewCountedItemController,
    ViewCountedItemService,
} from '@generated-crud/counted_item/view_counted_item.api';
import {
    ViewEmployeeController,
    ViewEmployeeService,
} from '@generated-crud/employee/view_employee.api';

@Module({
    controllers: [
        CreateAssetController,
        CreateAssignmentController,
        CreateCountedItemController,
        CreateEmployeeController,
        DeleteAssetController,
        DeleteAssignmentController,
        DeleteCountedItemController,
        DeleteEmployeeController,
        ListAssetController,
        ListAssignmentController,
        ListCountedItemController,
        ListEmployeeController,
        UpdateAssetController,
        UpdateAssignmentController,
        UpdateCountedItemController,
        UpdateEmployeeController,
        ViewAssetController,
        ViewAssignmentController,
        ViewCountedItemController,
        ViewEmployeeController,
    ],
    providers: [
        CreateAssetService,
        CreateAssignmentService,
        CreateCountedItemService,
        CreateEmployeeService,
        DeleteAssetService,
        DeleteAssignmentService,
        DeleteCountedItemService,
        DeleteEmployeeService,
        ListAssetService,
        ListAssignmentService,
        ListCountedItemService,
        ListEmployeeService,
        UpdateAssetService,
        UpdateAssignmentService,
        UpdateCountedItemService,
        UpdateEmployeeService,
        ViewAssetService,
        ViewAssignmentService,
        ViewCountedItemService,
        ViewEmployeeService,
    ],
})
export class GeneratedCrudApiModule {}
