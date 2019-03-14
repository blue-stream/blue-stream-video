import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { ClassificationController } from './classification.controller';

const ClassificationRouter: Router = Router();

ClassificationRouter.get('/sources', Wrapper.wrapAsync(ClassificationController.userSourcesSearch));
ClassificationRouter.get('/pps', Wrapper.wrapAsync(ClassificationController.userPpsSearch));

export { ClassificationRouter };
