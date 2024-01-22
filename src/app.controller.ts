import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getRoot(): Record<string, string> {
        const serverMetadata = {
            server: 'Branch API',
            status: 'active',
            health: 'healthy',
            version: '1.0.0',
        };
        return serverMetadata;
    }
}
