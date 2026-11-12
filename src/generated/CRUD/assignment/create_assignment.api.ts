import { Body, Controller, Injectable } from '@nestjs/common';
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

export const CreateAssignmentRequestSchema = z.object({
    condition_back: z.string(),
    returned_on: z.string(),
    condition_out: z.string(),
    assigned_on: z.string(),
    assignment_id: z.string(),
    notes: z.string(),
    employee: z.number().int().positive(),
    asset: z.number().int().positive(),
});

export class CreateAssignmentRequestDto extends createZodDto(
    CreateAssignmentRequestSchema,
) {}

@Injectable()
export class CreateAssignmentService {
    async create(body: CreateAssignmentRequestDto) {
        const parsed = CreateAssignmentRequestSchema.parse(body);
        return await Assignment.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateAssignmentController {
    constructor(private readonly service: CreateAssignmentService) {}

    @RequirePermission('assignment', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/assignment',
        tags: ['assignment'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'assignment created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createAssignment(
        @Body() body: CreateAssignmentRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'assignment created',
        });
    }
}
