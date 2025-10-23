import { getSandbox, proxyToSandbox, type Sandbox } from "@cloudflare/sandbox";
import { WorkerEntrypoint, env } from "cloudflare:workers";
import { Hono } from "hono";

type Env = {
  Sandbox: DurableObjectNamespace<Sandbox>;
};

const app = new Hono<{ Bindings: Env }>();

// This is the default API that comes from the template 
app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

const template = `
package main

import (
	"strings"
	"testing"
)

func TestHello(t *testing.T) {
	result := Hello()

	if result == "" {
		t.Error("Hello() returned an empty string")
		return
	}

	if !strings.Contains(result, "Hello, Cloudflare Sandbox!") {
		t.Errorf("Hello() returned %q, expected it to contain 'Hello, Cloudflare Sandbox!'", result)
		return
	}

	t.Logf("✓ Hello() returned: %s", result)
}
`;

// Our sandbox / code evaluator comes here
app.post("/run/:session", async (c) => {
  const session = c.req.param('session');
  const body = await c.req.formData();
  const code = body.get('code') as string;

 // TODO: Check KV for existing session or throw 400

  const sandbox = getSandbox(c.env.Sandbox, "go-executor-sandbox")

  // Create workspace directory for this session (idempotent)
  const workspaceDir = `/workspace/session-${session}`;
  await sandbox.mkdir(workspaceDir, { recursive: true });

  // Write files in parallel for faster setup
  await Promise.all([
    sandbox.writeFile(`${workspaceDir}/hello.go`, code),
    sandbox.writeFile(`${workspaceDir}/hello_test.go`, template),
    // Copy pre-initialized go.mod and go.sum from template (much faster than go mod init)
    sandbox.exec(`cp /workspace/template/go.* ${workspaceDir}/`)
  ]);

  // Run go test with optimized flags:
  // -count=1: disable test caching to ensure fresh results
  // -failfast: stop on first failure for faster feedback
  const result = await sandbox.exec(`cd ${workspaceDir} && go test -v -count=1 -failfast`);

  return c.json({
    stdout: result.stdout,
    error: result.stderr,
    exitCode: result.exitCode,
    success: result.success
  });
})

export default class Worker extends WorkerEntrypoint<Env> {
  fetch(request: Request): Response | Promise<Response> {
    return app.fetch(request, env);
  }
}

// Export the Sandbox 
export { Sandbox } from "@cloudflare/sandbox";

