import {
    Controller,
    Injectable,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { CountedItem } from '@entities/counted_item.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CountedItemIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class CountedItemIdParamsDto extends createZodDto(
    CountedItemIdParamsSchema,
) {}

@Injectable()
export class DeleteCountedItemService {
    async remove(id: number) {
        const record = await CountedItem.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('counted_item not found');
        }
        await CountedItem.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteCountedItemController {
    constructor(private readonly service: DeleteCountedItemService) {}

    @RequirePermission('counted_item', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/counted_item/:id',
        tags: ['counted_item'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'counted_item deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'counted_item not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteCountedItem(
        @Param() params: CountedItemIdParamsDto,
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const data = await this.service.remove(params.id);
        return apiSuccess(data, {
            message: 'counted_item deleted',
        });
    }
}
