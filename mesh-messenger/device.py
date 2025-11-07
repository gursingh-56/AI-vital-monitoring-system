"""
Bluetooth Mesh Device Implementation
"""
import uuid
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class DeviceState(Enum):
    """Device state enumeration"""
    IDLE = "idle"
    SCANNING = "scanning"
    CONNECTED = "connected"
    TRANSMITTING = "transmitting"
    RECEIVING = "receiving"


@dataclass
class MeshMessage:
    """Represents a message in the mesh network"""
    source_address: str
    destination_address: str
    message_type: str
    payload: Any
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = field(default_factory=lambda: __import__('time').time())


class MeshDevice:
    """Represents a Bluetooth Mesh device"""
    
    def __init__(self, device_id: str, name: str = None):
        self.device_id = device_id
        self.name = name or f"Device_{device_id[:8]}"
        self.address = device_id
        self.state = DeviceState.IDLE
        self.connected_devices: List[str] = []
        self.message_queue: List[MeshMessage] = []
        self.received_messages: List[MeshMessage] = []
        self.mesh_network = None
        
    def set_mesh_network(self, mesh_network):
        """Set the mesh network this device belongs to"""
        self.mesh_network = mesh_network
        
    def connect_to_device(self, target_device_id: str) -> bool:
        """Connect to another device in the mesh"""
        if not self.mesh_network:
            return False
            
        target_device = self.mesh_network.get_device(target_device_id)
        if not target_device:
            return False
            
        if target_device_id not in self.connected_devices:
            self.connected_devices.append(target_device_id)
            target_device.connected_devices.append(self.device_id)
            self.state = DeviceState.CONNECTED
            return True
        return False
        
    def disconnect_from_device(self, target_device_id: str) -> bool:
        """Disconnect from a device"""
        if target_device_id in self.connected_devices:
            self.connected_devices.remove(target_device_id)
            target_device = self.mesh_network.get_device(target_device_id) if self.mesh_network else None
            if target_device and self.device_id in target_device.connected_devices:
                target_device.connected_devices.remove(self.device_id)
            if not self.connected_devices:
                self.state = DeviceState.IDLE
            return True
        return False
        
    def send_message(self, destination_address: str, message_type: str, payload: Any) -> bool:
        """Send a message to another device"""
        if not self.mesh_network:
            return False
            
        message = MeshMessage(
            source_address=self.address,
            destination_address=destination_address,
            message_type=message_type,
            payload=payload
        )
        
        # Add to queue for processing
        self.message_queue.append(message)
        self.state = DeviceState.TRANSMITTING
        
        # Process message through mesh network
        return self.mesh_network.route_message(message)
        
    def receive_message(self, message: MeshMessage):
        """Receive a message from the mesh network"""
        self.received_messages.append(message)
        self.state = DeviceState.RECEIVING
        # Process the message
        self._handle_message(message)
        
    def _handle_message(self, message: MeshMessage):
        """Handle received message"""
        # Override in subclasses for custom handling
        pass
        
    def get_status(self) -> Dict[str, Any]:
        """Get device status"""
        return {
            "device_id": self.device_id,
            "name": self.name,
            "address": self.address,
            "state": self.state.value,
            "connected_devices": self.connected_devices,
            "queued_messages": len(self.message_queue),
            "received_messages": len(self.received_messages)
        }

