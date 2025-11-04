package network

import (
	"fmt"
	"net"
)

// Transport represents the network transport layer.
type Transport interface {
	Listen() error
	Close() error
}

type tcpTransport struct {
	listener net.Listener
	addr     string
}

// NewTransport creates a new TCP transport.
func NewTransport(addr string) (Transport, error) {
	return &tcpTransport{
		addr: addr,
	},
	nil
}

// Listen starts listening for incoming connections.
func (t *tcpTransport) Listen() error {
	ln, err := net.Listen("tcp", t.addr)
	if err != nil {
		return err
	}
	t.listener = ln

	fmt.Printf("Transport listening on %s\n", t.addr)

	for {
		conn, err := t.listener.Accept()
		if err != nil {
			fmt.Printf("Error accepting connection: %v\n", err)
			continue
		}
		go t.handleConn(conn)
	}
}

// Close stops listening for incoming connections.
func (t *tcpTransport) Close() error {
	if t.listener != nil {
		return t.listener.Close()
	}
	return nil
}

func (t *tcpTransport) handleConn(conn net.Conn) {
	defer conn.Close()
	fmt.Printf("Accepted connection from %s\n", conn.RemoteAddr())
	// In a real implementation, we would handle the connection here,
	// likely by creating a new Peer and reading messages.
}
