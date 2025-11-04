package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"C:\\Users\\HARNOOR\\mesh-messenger\\node"
)

func main() {
	fmt.Println("Starting mesh-messenger node...")

	// Create a new node
	n, err := node.NewNode()
	if err != nil {
		fmt.Printf("Error creating node: %v\n", err)
		os.Exit(1)
	}

	// Start the node
	if err := n.Start(); err != nil {
		fmt.Printf("Error starting node: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Node started with ID: %s\n", n.ID)
	fmt.Println("Waiting for peers...")

	// Wait for a shutdown signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	fmt.Println("\nShutting down node...")
	if err := n.Stop(); err != nil {
		fmt.Printf("Error stopping node: %v\n", err)
	}

	fmt.Println("Node stopped.")
}
