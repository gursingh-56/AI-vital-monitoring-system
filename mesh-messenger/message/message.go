package message

import (
	"encoding/json"
	"time"
)

// MessageType defines the type of a message.
type MessageType string

const (
	// TextMessage is a standard text message.
	TextMessage MessageType = "text"
	// StatusMessage is a status update.
	StatusMessage MessageType = "status"
	// DiscoveryMessage is used for peer discovery.
	DiscoveryMessage MessageType = "discovery"
)

// Message represents a message sent over the mesh network.
type Message struct {
	ID        string      `json:"id"`
	Type      MessageType `json:"type"`
	From      string      `json:"from"`
	To        string      `json:"to"`
	Timestamp time.Time   `json:"timestamp"`
	Payload   []byte      `json:"payload"`
}

// NewTextMessage creates a new text message.
func NewTextMessage(from, to, content string) (*Message, error) {
	// In a real implementation, we would generate a unique ID.
	return &Message{
		ID:        "temp-id",
		Type:      TextMessage,
		From:      from,
		To:        to,
		Timestamp: time.Now(),
		Payload:   []byte(content),
	}, nil
}

// ToJSON converts the message to a JSON byte slice.
func (m *Message) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}
