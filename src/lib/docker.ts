import Docker from 'dockerode';

const docker = new Docker(
  process.env.DOCKER_SOCKET 
    ? { socketPath: process.env.DOCKER_SOCKET }
    : process.env.NODE_ENV === 'production'
      ? { host: 'docker', port: 2375 }
      : new Docker()
);

export default docker; 