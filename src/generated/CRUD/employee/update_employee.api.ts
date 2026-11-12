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
import { Employee } from '@entities/employee.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const UpdateEmployeeRequestSchema = z
    .object({
        left_on: z.string(),
        joined_on: z.string(),
        status: z.string(),
        location: z.string(),
        department: z.string(),
        email: z.string(),
        name: z.string(),
        employee_id: z.string(),
    })
    .partial();

export class UpdateEmployeeRequestDto extends createZodDto(
    UpdateEmployeeRequestSchema,
) {}

export const EmployeeIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class EmployeeIdParamsDto extends createZodDto(EmployeeIdParamsSchema) {}

@Injectable()
export class UpdateEmployeeService {
    async update(id: number, body: UpdateEmployeeRequestDto) {
        const record = await Employee.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('employee not found');
        }
        const parsed = UpdateEmployeeRequestSchema.parse(body);
        await Employee.updateByPk(id, parsed);
        return await Employee.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateEmployeeController {
    constructor(private readonly service: UpdateEmployeeService) {}

    @RequirePermission('employee', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/employee/:id',
        tags: ['employee'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'employee updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'employee not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateEmployee(
        @Param() params: EmployeeIdParamsDto,
        @Body() body: UpdateEmployeeRequestDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.update(params.id, body);
        return apiSuccess(data, {
            message: 'employee updated',
        });
    }
}
