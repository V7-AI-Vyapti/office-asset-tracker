import { Controller, Injectable, Query } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
    buildPaginationMeta,
} from '@vyapti/core/custom_api_response';
import { Employee } from '@entities/employee.entity';
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

export const ListEmployeeQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().nullable(),
    sortBy: z.enum(['id', 'left_on']).default('id'),
    sortOrder: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['ASC', 'DESC']).default('DESC'),
    ),
});

export class ListEmployeeQueryDto extends createZodDto(
    ListEmployeeQuerySchema,
) {}

const LIST_EMPLOYEE_SORT_COLUMNS = {
    id: 'id',
    left_on: 'left_on',
} as const;

@Injectable()
export class ListEmployeeService {
    async list(query: ListEmployeeQueryDto) {
        const pagination = resolvePagination(query);
        const search = normalizeSearch(query.search);
        const where: Record<string, unknown> = {
            deleted_at: IsNull(),
        };
        if (search) {
            where.left_on = ILike(`%${search}%`);
        }
        const order = buildAllowedOrder({
            columns: LIST_EMPLOYEE_SORT_COLUMNS,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            defaultSortBy: 'id',
            defaultSortOrder: 'DESC',
        });
        const [rows, total] = await Promise.all([
            Employee.filter(where, {
                order,
                skip: pagination.skip,
                take: pagination.take,
            }),
            Employee.countOf(where),
        ]);
        return { items: rows, total, pagination };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ListEmployeeController {
    constructor(private readonly service: ListEmployeeService) {}

    @RequirePermission('employee', 'list')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/employee',
        tags: ['employee'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'employee list fetched',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async listEmployee(
        @Query() query: ListEmployeeQueryDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const { items, total, pagination } = await this.service.list(query);
        return apiSuccess(items, {
            message: 'employee list fetched',
            meta: buildPaginationMeta(pagination.page, pagination.limit, total),
        });
    }
}
