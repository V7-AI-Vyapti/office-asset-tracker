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
import { Asset } from '@entities/asset.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const AssetIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class AssetIdParamsDto extends createZodDto(AssetIdParamsSchema) {}

@Injectable()
export class ViewAssetService {
    async getById(id: number) {
        const record = await Asset.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('asset not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewAssetController {
    constructor(private readonly service: ViewAssetService) {}

    @RequirePermission('asset', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/asset/:id',
        tags: ['asset'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'asset fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'asset not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getAsset(
        @Param() params: AssetIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'asset fetched',
        });
    }
}
