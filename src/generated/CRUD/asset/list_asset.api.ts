import { Controller, Injectable, Query } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { Asset } from '@entities/asset.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ILike, IsNull } from 'typeorm';
import {
    buildAllowedOrder,
    normalizeSearch,
    resolvePagination,
} from '@vulcan/shared/utils/list-query';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const ListAssetQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['asset_id', 'condition']).default('asset_id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
    current_holder: z.coerce.number().int().positive().optional(),
});

export class ListAssetQueryDto extends createZodDto(ListAssetQuerySchema) {}

const LIST_ASSET_SORT_COLUMNS = {
    asset_id: 'asset_id',
    condition: 'condition',
} as const;

@Injectable()
export class ListAssetService {
    async list(query: ListAssetQueryDto) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.condition = ILike(`%${search}%`);
        }
        if (query.current_holder != null) {
            where.current_holder = query.current_holder;
        }
        const order = buildAllowedOrder({
            columns: LIST_ASSET_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'asset_id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            Asset.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            Asset.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListAssetController {
    constructor(private readonly service: ListAssetService) {}

    @RequirePermission('asset', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/asset',
        tags: ['asset'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'asset list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listAsset(
        @Query() query: ListAssetQueryDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(query);
        return apiSuccess(items, {
            message: 'asset list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
