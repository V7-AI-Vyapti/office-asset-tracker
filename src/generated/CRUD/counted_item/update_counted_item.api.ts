import {
    Body,
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

export const UpdateCountedItemRequestSchema = z
    .object({
        item_code: z.string(),
        category: z.string(),
        location: z.string(),
        name: z.string(),
        qty_in_use: z.number().int(),
        qty_total: z.number().int(),
        unit_price_inr: z.number().int(),
    })
    .partial();

export class UpdateCountedItemRequestDto extends createZodDto(
    UpdateCountedItemRequestSchema,
) {}

export const CountedItemIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class CountedItemIdParamsDto extends createZodDto(
    CountedItemIdParamsSchema,
) {}

@Injectable()
export class UpdateCountedItemService {
    async update(id: number, body: UpdateCountedItemRequestDto) {
        const record = await CountedItem.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('counted_item not found');
        }
        const parsed = UpdateCountedItemRequestSchema.parse(body);
        await CountedItem.updateByPk(id, parsed);
        return await CountedItem.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateCountedItemController {
    constructor(private readonly service: UpdateCountedItemService) {}

    @RequirePermission('counted_item', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/counted_item/:id',
        tags: ['counted_item'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'counted_item updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'counted_item not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateCountedItem(
        @Param() params: CountedItemIdParamsDto,
        @Body() body: UpdateCountedItemRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'counted_item updated',
        });
    }
}
