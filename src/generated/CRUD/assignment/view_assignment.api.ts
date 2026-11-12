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
import { Assignment } from '@entities/assignment.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const AssignmentIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class AssignmentIdParamsDto extends createZodDto(
    AssignmentIdParamsSchema,
) {}

@Injectable()
export class ViewAssignmentService {
    async getById(id: number) {
        const record = await Assignment.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('assignment not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewAssignmentController {
    constructor(private readonly service: ViewAssignmentService) {}

    @RequirePermission('assignment', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/assignment/:id',
        tags: ['assignment'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'assignment fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'assignment not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getAssignment(
        @Param() params: AssignmentIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'assignment fetched',
        });
    }
}
