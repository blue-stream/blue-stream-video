import { Router } from 'express';
import { VideoRouter } from './video/video.router';
import { ViewRouter } from './view/view.router';

const AppRouter: Router = Router();

AppRouter.use('/api/video', VideoRouter);
AppRouter.use('/api/view', ViewRouter);

export { AppRouter };
