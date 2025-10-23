package main

import (
	"strings"
	"testing"
)

func TestHello(t *testing.T) {
	result := Hello()
	if !strings.Contains(result, "Hello") {
		t.Error("Test failed")
	}
}
