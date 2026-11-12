import { Body, Controller, Injectable } from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Employee } from '@entities/employee.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const CreateEmployeeRequestSchema = z.object({
    left_on: z.string(),
    joined_on: z.string(),
    status: z.string(),
    location: z.string(),
    department: z.string(),
    email: z.string(),
    name: z.string(),
    employee_id: z.string(),
});

export class CreateEmployeeRequestDto extends createZodDto(
    CreateEmployeeRequestSchema,
) {}

@Injectable()
export class CreateEmployeeService {
    async create(body: CreateEmployeeRequestDto) {
        const parsed = CreateEmployeeRequestSchema.parse(body);
        return await Employee.createOne(parsed);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateEmployeeController {
    constructor(private readonly service: CreateEmployeeService) {}

    @RequirePermission('employee', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/employee',
        tags: ['employee'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'employee created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createEmployee(
        @Body() body: CreateEmployeeRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.create(body);
        return apiSuccess(data, {
            message: 'employee created',
        });
    }
}
