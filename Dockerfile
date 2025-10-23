FROM docker.io/cloudflare/sandbox:0.4.4

# On a Mac with Apple Silicon, you might need to specify the platform:
# FROM --platform=linux/arm64 docker.io/cloudflare/sandbox:0.3.6
ENV GOVERSION="1.23.5"

# Install Go from official source
RUN apt-get update && \
    apt-get install -y wget && \
    wget --no-check-certificate https://go.dev/dl/go${GOVERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GOVERSION}.linux-amd64.tar.gz && \
    rm go${GOVERSION}.linux-amd64.tar.gz && \
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

# Copy template Go files for cache warming
COPY docker/template/*.go /workspace/template/

# Warm up Go build cache by running a test during container build
# This pre-compiles standard library packages (strings, testing, etc.)
# Run twice to ensure test cache and build cache are fully warmed
RUN cd /workspace/template && \
    go test -v && \
    go mod tidy && \
    go test -v && \
    echo "✓ Go build cache warmed up"
