import { Router } from 'express';
import { Wrapper } from '../utils/wrapper';
import { VideoValidator } from './validator/video.validator';
import { VideoController } from './video.contoller';

const VideoRouter: Router = Router();

VideoRouter.post('/', VideoValidator.canCreate, Wrapper.wrapAsync(VideoController.create));
VideoRouter.put('/:id', VideoValidator.canUpdateById, Wrapper.wrapAsync(VideoController.updateById));
VideoRouter.delete('/:id', VideoValidator.canDeleteById, Wrapper.wrapAsync(VideoController.deleteById));
VideoRouter.get('/one', VideoValidator.canGetOne, Wrapper.wrapAsync(VideoController.getOne));
VideoRouter.get('/many', VideoValidator.canGetMany, Wrapper.wrapAsync(VideoController.getMany));
VideoRouter.get('/amount', VideoValidator.canGetAmount, Wrapper.wrapAsync(VideoController.getAmount));
VideoRouter.get('/:id', VideoValidator.canGetById, Wrapper.wrapAsync(VideoController.getById));

export { VideoRouter };

