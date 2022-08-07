import * as express from 'express';
import { AddressInfo } from 'net';

export interface DummyServer {
  url: string;
  close: () => void;
}

export const createDummyServer = (): DummyServer => {
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

  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const url = `http://localhost:${port}`;

  const close = (): void => {
    server.close();
  };

  return { url, close };
};
