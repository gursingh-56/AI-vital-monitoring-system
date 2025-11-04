# 🌐 Mesh Messenger

A decentralized, peer-to-peer mesh messaging system inspired by the principles of decentralization and resilience. This project is a conceptual exploration of building a messaging system that does not rely on central servers, making it censorship-resistant and highly available.

## ✨ Features

*   **Decentralized**: No central server or single point of failure.
*   **Peer-to-Peer**: Nodes communicate directly with each other.
*   **Mesh Networking**: Messages are relayed through a mesh of nodes to reach their destination.
*   **Resilient**: The network can withstand node failures and network partitions.

## 📂 Project Structure

```
mesh-messenger/
├── main.go
├── node/
│   ├── node.go
│   └── peer.go
├── message/
│   └── message.go
└── network/
    ├── discovery.go
    └── transport.go
```

## 🚀 Getting Started

This project is written in Go.

### Prerequisites

*   Go (v1.18 or later)

### Running the Node

1.  **Navigate to the project directory**:
    ```bash
    cd mesh-messenger
    ```
2.  **Run the main application**:
    ```bash
    go run main.go
    ```

This will start a new mesh messenger node. In a real-world scenario, you would run multiple nodes on different machines, and they would discover each other and form a mesh network.

## 📜 License

This project is licensed under the [MIT License](LICENSE).
