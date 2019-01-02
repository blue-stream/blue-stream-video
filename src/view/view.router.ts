import { Router } from 'express';
import { ViewController } from './view.controller';
import { Wrapper } from '../utils/wrapper';
import { ViewValidator } from './validator/view.validator';

const ViewRouter: Router = Router();

ViewRouter.post('/:video', ViewValidator.canView, Wrapper.wrapAsync(ViewController.addView));
ViewRouter.get('/', Wrapper.wrapAsync(ViewController.getViewedVideos));

export { ViewRouter };
