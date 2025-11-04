package node

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"

	"C:\\Users\\HARNOOR\\mesh-messenger\\network"
)

// Node represents a single node in the mesh network.
type Node struct {
	ID        string
	transport network.Transport
	peers     map[string]*Peer
	lock      sync.RWMutex
}

// NewNode creates a new mesh network node.
func NewNode() (*Node, error) {
	// Generate a random ID for the node
	rawID := make([]byte, 16)
	if _, err := rand.Read(rawID); err != nil {
		return nil, err
	}
	ID := hex.EncodeToString(rawID)

	// Create a new transport
	transport, err := network.NewTransport(":8080") // Example port
	if err != nil {
		return nil, err
	}

	return &Node{
		ID:        ID,
		transport: transport,
		peers:     make(map[string]*Peer),
	},
	nil
}

// Start begins the node's operation.
func (n *Node) Start() error {
	go n.transport.Listen()
	fmt.Println("Node transport started.")
	// In a real implementation, we would start peer discovery here.
	return nil
}

// Stop halts the node's operation.
func (n *Node) Stop() error {
	// In a real implementation, we would gracefully disconnect from peers.
	return n.transport.Close()
}
