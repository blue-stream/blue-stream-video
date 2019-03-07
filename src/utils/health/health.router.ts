import { Router } from 'express';
import { HealthController } from './health.controller';

const HealthRouter: Router = Router();

HealthRouter.get('/', HealthController.healthCheck);

export { HealthRouter };
