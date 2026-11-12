import { Body, Controller, Injectable } from '@nestjs/common';
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

export const CreateCountedItemRequestSchema = z.object({
    item_code: z.string(),
    category: z.string(),
    location: z.string(),
    name: z.string(),
    qty_in_use: z.number().int(),
    qty_total: z.number().int(),
    unit_price_inr: z.number().int(),
});

export class CreateCountedItemRequestDto extends createZodDto(
    CreateCountedItemRequestSchema,
) {}

@Injectable()
export class CreateCountedItemService {
    async create(body: CreateCountedItemRequestDto) {
        const parsed = CreateCountedItemRequestSchema.parse(body);
        return await CountedItem.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateCountedItemController {
    constructor(private readonly service: CreateCountedItemService) {}

    @RequirePermission('counted_item', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/counted_item',
        tags: ['counted_item'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'counted_item created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createCountedItem(
        @Body() body: CreateCountedItemRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'counted_item created',
        });
    }
}
