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
import { Employee } from '@entities/employee.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';

export const EmployeeIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class EmployeeIdParamsDto extends createZodDto(EmployeeIdParamsSchema) {}

@Injectable()
export class ViewEmployeeService {
    async getById(id: number) {
        const record = await Employee.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('employee not found');
        }
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewEmployeeController {
    constructor(private readonly service: ViewEmployeeService) {}

    @RequirePermission('employee', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/employee/:id',
        tags: ['employee'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'employee fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'employee not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getEmployee(
        @Param() params: EmployeeIdParamsDto,
    ): Promise<ApiSuccessResponse<unknown>> {
        const data = await this.service.getById(params.id);
        return apiSuccess(data, {
            message: 'employee fetched',
        });
    }
}
