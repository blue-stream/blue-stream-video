import { UserError } from './applicationError';

export class PropertyInvalidError extends UserError {
    constructor(message?: string) {
        super(message || `Property is invalid`, 400);
    }
}

export class IdInvalidError extends UserError {
    constructor(message?: string) {
        super(message || `Id is invalid`, 400);
    }
}

export class VideoNotFoundError extends UserError {
    constructor(message?: string) {
        super(message || `Video not found`, 404);
    }
}

export class VideoValidationFailedError extends UserError {
    constructor(field?: string) {
        super(`Video validation failed ${!!field ? 'for field ' + field : ''}`, 400);
    }
}
