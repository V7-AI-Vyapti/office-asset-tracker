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
import { Asset } from '@entities/asset.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateAssetRequestSchema = z
    .object({
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
    })
    .partial();

export class UpdateAssetRequestDto extends createZodDto(
    UpdateAssetRequestSchema,
) {}

export const AssetIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class AssetIdParamsDto extends createZodDto(AssetIdParamsSchema) {}

@Injectable()
export class UpdateAssetService {
    async update(id: number, body: UpdateAssetRequestDto) {
        const record = await Asset.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('asset not found');
        }
        const parsed = UpdateAssetRequestSchema.parse(body);
        await Asset.updateByPk(id, parsed);
        return await Asset.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateAssetController {
    constructor(private readonly service: UpdateAssetService) {}

    @RequirePermission('asset', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/asset/:id',
        tags: ['asset'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'asset updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'asset not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateAsset(
        @Param() params: AssetIdParamsDto,
        @Body() body: UpdateAssetRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'asset updated',
        });
    }
}
