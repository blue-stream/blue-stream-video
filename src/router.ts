import { Router } from 'express';
import { VideoRouter } from './video/video.router';
import { ViewRouter } from './view/view.router';
import { ClassificationRouter } from './classification/classification.router';
import { HealthRouter } from './utils/health/health.router';

const AppRouter: Router = Router();

AppRouter.use('/api/video', VideoRouter);
AppRouter.use('/api/view', ViewRouter);
AppRouter.use('/api/classification', ClassificationRouter);
AppRouter.use('/health', HealthRouter);

export { AppRouter };
