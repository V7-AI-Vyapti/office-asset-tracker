import { Controller, Injectable, Query } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { Assignment } from '@entities/assignment.entity';
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

export const ListAssignmentQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['id', 'condition_back']).default('id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
    employee: z.coerce.number().int().positive().optional(),
    asset: z.coerce.number().int().positive().optional(),
});

export class ListAssignmentQueryDto extends createZodDto(
    ListAssignmentQuerySchema,
) {}

const LIST_ASSIGNMENT_SORT_COLUMNS = {
    id: 'id',
    condition_back: 'condition_back',
} as const;

@Injectable()
export class ListAssignmentService {
    async list(query: ListAssignmentQueryDto) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.condition_back = ILike(`%${search}%`);
        }
        if (query.employee != null) {
            where.employee = query.employee;
        }
        if (query.asset != null) {
            where.asset = query.asset;
        }
        const order = buildAllowedOrder({
            columns: LIST_ASSIGNMENT_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            Assignment.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            Assignment.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListAssignmentController {
    constructor(private readonly service: ListAssignmentService) {}

    @RequirePermission('assignment', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/assignment',
        tags: ['assignment'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'assignment list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listAssignment(
        @Query() query: ListAssignmentQueryDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(query);
        return apiSuccess(items, {
            message: 'assignment list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
