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
import { Assignment } from '@entities/assignment.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateAssignmentRequestSchema = z
    .object({
        condition_back: z.string(),
        returned_on: z.string(),
        condition_out: z.string(),
        assigned_on: z.string(),
        assignment_id: z.string(),
        notes: z.string(),
        employee: z.number().int().positive(),
        asset: z.number().int().positive(),
    })
    .partial();

export class UpdateAssignmentRequestDto extends createZodDto(
    UpdateAssignmentRequestSchema,
) {}

export const AssignmentIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class AssignmentIdParamsDto extends createZodDto(
    AssignmentIdParamsSchema,
) {}

@Injectable()
export class UpdateAssignmentService {
    async update(id: number, body: UpdateAssignmentRequestDto) {
        const record = await Assignment.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('assignment not found');
        }
        const parsed = UpdateAssignmentRequestSchema.parse(body);
        await Assignment.updateByPk(id, parsed);
        return await Assignment.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateAssignmentController {
    constructor(private readonly service: UpdateAssignmentService) {}

    @RequirePermission('assignment', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/assignment/:id',
        tags: ['assignment'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'assignment updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'assignment not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateAssignment(
        @Param() params: AssignmentIdParamsDto,
        @Body() body: UpdateAssignmentRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'assignment updated',
        });
    }
}
