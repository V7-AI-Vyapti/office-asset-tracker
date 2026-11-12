import { Body, Controller, Injectable } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Asset } from '@entities/asset.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateAssetRequestSchema = z.object({
    condition: z.string(),
    warranty_until: z.string(),
    vendor: z.string(),
    purchase_date: z.string(),
    serial_no: z.string(),
    model: z.string(),
    brand: z.string(),
    tracking: z.string(),
    category: z.string(),
    type: z.string(),
    asset_tag: z.string(),
    status: z.string(),
    location: z.string(),
    price_inr: z.number().int(),
    current_holder: z.number().int().positive(),
});

export class CreateAssetRequestDto extends createZodDto(
    CreateAssetRequestSchema,
) {}

@Injectable()
export class CreateAssetService {
    async create(body: CreateAssetRequestDto) {
        const parsed = CreateAssetRequestSchema.parse(body);
        return await Asset.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateAssetController {
    constructor(private readonly service: CreateAssetService) {}

    @RequirePermission('asset', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/asset',
        tags: ['asset'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'asset created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createAsset(
        @Body() body: CreateAssetRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'asset created',
        });
    }
}
