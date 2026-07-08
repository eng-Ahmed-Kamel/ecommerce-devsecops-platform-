FROM jenkins/jenkins:lts

USER root

# Install basic packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    git \
    nodejs \
    npm \
    docker.io \
    && rm -rf /var/lib/apt/lists/*


# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
    -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws


# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl


# Install Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash


# Install Trivy
RUN apt-get update \
    && apt-get install -y wget apt-transport-https gnupg \
    && wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key \
    | gpg --dearmor -o /usr/share/keyrings/trivy.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" \
    > /etc/apt/sources.list.d/trivy.list \
    && apt-get update \
    && apt-get install -y trivy \
    && rm -rf /var/lib/apt/lists/*


# Allow Jenkins user
RUN usermod -aG root jenkins

USER jenkins
