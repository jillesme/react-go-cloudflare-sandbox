FROM docker.io/cloudflare/sandbox:0.4.4

# On a Mac with Apple Silicon, you might need to specify the platform:
# FROM --platform=linux/arm64 docker.io/cloudflare/sandbox:0.3.6

# Install Go 1.23.5 from official source
RUN apt-get update && \
    apt-get install -y wget && \
    wget --no-check-certificate https://go.dev/dl/go1.23.5.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.23.5.linux-amd64.tar.gz && \
    rm go1.23.5.linux-amd64.tar.gz && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Go environment variables
ENV GOPATH=/go
ENV PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

# Create workspace directory
RUN mkdir -p /workspace

# Create template workspace with pre-initialized go.mod for faster session startup
RUN mkdir -p /workspace/template && \
    cd /workspace/template && \
    go mod init hello
