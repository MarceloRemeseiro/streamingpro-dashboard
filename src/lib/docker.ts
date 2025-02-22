import Docker from 'dockerode';

const dockerOptions = process.env.DOCKER_SOCKET 
  ? { socketPath: process.env.DOCKER_SOCKET }
  : process.env.NODE_ENV === 'production'
    ? { host: 'docker', port: 2375 }
    : { socketPath: '/var/run/docker.sock' };

const docker = new Docker(dockerOptions);

export default docker; 