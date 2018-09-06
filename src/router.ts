import { Router } from 'express';
import { VideoRouter } from './video/video.router';

const AppRouter: Router = Router();

AppRouter.use('/api/video', VideoRouter);

export { AppRouter };
