import { Express } from 'express';
import * as express from 'express';

export const createDummyServer = (): Express => {
  const app = express();
  app.get('/tasks', (req, res) => {
    switch (req.query.state) {
      case 'bad':
        res.contentType('application/json');
        res.writeHead(400);
        res.end(JSON.stringify({ err: 'Bad request' }));
        break;
      case 'fail':
        res.writeHead(500);
        res.end('Internal Server Error');
        break;
      default:
        res.contentType('application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ id: 1 }));
        break;
    }
  });

  return app;
};
