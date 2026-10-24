# Docker & Kubernetes

### 1. What is Docker, why do we need it?

Docker packages an application and its dependencies into portable containers that share the host OS kernel, making environments consistent from development through deployment and ending "it works on my machine." It improves reproducibility, isolation, and fast startup compared with VMs, but images need security scanning, small build contexts, and externalized state.

### 2. What are a Dockerfile, a docker image and container?

A Dockerfile is a text recipe of build steps: choose a base image (FROM node:24-alpine), set WORKDIR, copy package files, install dependencies, copy source, build, set a non-root user, EXPOSE the port, and define CMD; multi-stage builds reduce final size. An image is the immutable, layered template produced by docker build. A container is a running (or stopped) instance of an image with its own writable layer, process, environment, network, and mounted volumes; many containers can run from one image.

### 3. What is docker-compose and what problem does it solve?

Docker Compose defines and runs a multi-container environment in one YAML file (compose.yaml), including services, networks, volumes, ports, dependencies, and environment variables. It solves having to start and wire several containers by hand: one docker compose up brings up the API, database, cache, and queue together with consistent configuration for every developer.

### 4. What is Kubernetes and its purpose?

Kubernetes (K8s) is a container-orchestration platform that schedules containers across a cluster of machines and manages deployment, scaling, self-healing (restarting failed containers), service discovery, load balancing, rolling updates, and configuration. It is powerful but operationally complex and not required for every application.

- **What is a pod, a deployment, and a service?**  
  A Pod is Kubernetes' smallest deployable unit, containing one or more tightly coupled containers that share a network and storage. A Deployment declares the desired number of Pod replicas and manages rolling updates, rollback, and recovery. A Service provides a stable network endpoint (DNS name and IP) and load balancing for the matching Pods, whose own IPs change.
- **How do Kubernetes and Docker work together?**  
  Docker builds container images and pushes them to a registry; Kubernetes pulls those images and schedules and manages containers created from them. Modern Kubernetes uses a container runtime such as containerd through the CRI rather than Docker Engine directly, but Docker-built (OCI) images remain the standard packaging format.
