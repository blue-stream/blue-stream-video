import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import { config } from './config';
import { AppRouter } from './router';
import { userErrorHandler, serverErrorHandler, unknownErrorHandler } from './utils/errors/errorHandler';
import { Authenticator } from './utils/authenticator';

export class Server {
    public app: express.Application;
    private server: http.Server;

    public static bootstrap(): Server {
        return new Server();
    }

    private constructor() {
        this.app = express();
        this.configureMiddlewares();
        this.app.use(AppRouter);
        this.initializeErrorHandler();
        this.server = http.createServer(this.app);
        this.server.listen(config.server.port, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} environment on port ${config.server.port}`);
        });
    }

    private configureMiddlewares() {
        this.app.use(helmet());

        this.app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
            const origin = req.headers.origin as string;

            if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type');

            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }

            return next();
        });

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        }

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        if (config.authentication.required) {
            this.app.use(Authenticator.initialize());
            this.app.use(Authenticator.middleware);
        }
    }

    private initializeErrorHandler() {
        this.app.use(userErrorHandler);
        this.app.use(serverErrorHandler);
        this.app.use(unknownErrorHandler);
    }
}
