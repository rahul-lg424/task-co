import Fastify from 'fastify';

const server = Fastify({ logger: false });

server.get('/', async () => ({
  data: {
    status: 'ok',
  },
}));

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
