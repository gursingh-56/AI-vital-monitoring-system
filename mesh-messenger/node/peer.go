package node

import (
	"net"
	"time"
)

// Peer represents a connected node in the mesh network.
type Peer struct {
	ID         string
	conn       net.Conn
	lastSeen   time.Time
}

// NewPeer creates a new peer.
func NewPeer(conn net.Conn) *Peer {
	return &Peer{
		conn:     conn,
		lastSeen: time.Now(),
	}
}

// Send sends a message to the peer.
func (p *Peer) Send(msg []byte) (int, error) {
	return p.conn.Write(msg)
}
