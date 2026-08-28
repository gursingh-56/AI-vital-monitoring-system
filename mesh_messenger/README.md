# 🌐 Mesh Messenger

An **in-process simulation** of a Bluetooth Mesh network, written in Python. It models
devices, connections, message routing across a mesh, and chunked data transfer to an
external IP address, and exposes all of it over a small Flask API.

This is a standalone simulation. It is not wired into the AI Vital Monitoring
frontend or backend, and it does not touch real Bluetooth hardware.

## ✨ What it models

*   **Devices** — each with an address, a state machine (`idle`, `scanning`,
    `connected`, `transmitting`, `receiving`), a message queue and an inbox.
*   **Mesh network** — device registry, direct connections, message routing and a
    history of everything that has been sent.
*   **Data transfer** — pushing text and files to a target IP/port over HTTP,
    with a transfer history.

## 📂 Project structure

```
mesh_messenger/
├── __init__.py
├── device.py          # MeshDevice, MeshMessage, DeviceState
├── mesh_network.py    # MeshNetwork: registry + routing
├── data_transfer.py   # DataTransfer: send text/files to an IP
├── api_server.py      # Flask API over the simulation
└── example_usage.py   # End-to-end walkthrough against the API
```

## 🚀 Getting started

### Prerequisites

*   Python 3.10+
*   `pip install flask flask-cors requests`

### Running the API server

Run it as a module from the **repository root** so the package-relative imports
resolve:

```bash
python -m mesh_messenger.api_server
```

The API is then available at `http://localhost:5000`.

### Running the example

With the server running, in a second terminal:

```bash
python mesh_messenger/example_usage.py
```

## 🔌 API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/mesh/devices` | List devices |
| POST | `/api/mesh/devices` | Create a device |
| GET | `/api/mesh/devices/<id>` | Get one device |
| DELETE | `/api/mesh/devices/<id>` | Remove a device |
| POST | `/api/mesh/connect` | Connect two devices |
| POST | `/api/mesh/disconnect` | Disconnect two devices |
| POST | `/api/mesh/send` | Send a message between devices |
| POST | `/api/transfer/text` | Send text to an IP address |
| POST | `/api/transfer/file` | Send a file to an IP address |
| GET | `/api/transfer/history` | Transfer history |

## 📜 License

This project is licensed under the [MIT License](../LICENSE).
