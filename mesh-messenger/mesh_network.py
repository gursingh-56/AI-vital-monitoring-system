"""
Bluetooth Mesh Network Implementation
"""
from typing import Dict, Optional, List
from .device import MeshDevice, MeshMessage


class MeshNetwork:
    """Manages the Bluetooth Mesh network"""
    
    def __init__(self, network_id: str = "default_mesh"):
        self.network_id = network_id
        self.devices: Dict[str, MeshDevice] = {}
        self.message_history: List[MeshMessage] = []
        
    def add_device(self, device: MeshDevice) -> bool:
        """Add a device to the mesh network"""
        if device.device_id in self.devices:
            return False
        device.set_mesh_network(self)
        self.devices[device.device_id] = device
        return True
        
    def remove_device(self, device_id: str) -> bool:
        """Remove a device from the mesh network"""
        if device_id not in self.devices:
            return False
        device = self.devices[device_id]
        # Disconnect from all devices
        for connected_id in device.connected_devices.copy():
            device.disconnect_from_device(connected_id)
        del self.devices[device_id]
        return True
        
    def get_device(self, device_id: str) -> Optional[MeshDevice]:
        """Get a device by ID"""
        return self.devices.get(device_id)
        
    def route_message(self, message: MeshMessage) -> bool:
        """Route a message through the mesh network"""
        self.message_history.append(message)
        
        destination_device = self.get_device(message.destination_address)
        if not destination_device:
            return False
            
        # Check if devices are directly connected
        source_device = self.get_device(message.source_address)
        if not source_device:
            return False
            
        if message.destination_address in source_device.connected_devices:
            # Direct connection - deliver immediately
            destination_device.receive_message(message)
            return True
        else:
            # Try to find a path through connected devices (simple routing)
            path = self._find_path(message.source_address, message.destination_address)
            if path:
                # Forward through intermediate devices
                for i in range(len(path) - 1):
                    intermediate = self.get_device(path[i])
                    if intermediate:
                        intermediate.receive_message(message)
                destination_device.receive_message(message)
                return True
                
        return False
        
    def _find_path(self, source: str, destination: str) -> Optional[List[str]]:
        """Find a path between two devices using BFS"""
        if source == destination:
            return [source]
            
        visited = set()
        queue = [(source, [source])]
        
        while queue:
            current, path = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            
            device = self.get_device(current)
            if not device:
                continue
                
            for neighbor in device.connected_devices:
                if neighbor == destination:
                    return path + [neighbor]
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor]))
                    
        return None
        
    def get_network_status(self) -> Dict:
        """Get network status"""
        return {
            "network_id": self.network_id,
            "device_count": len(self.devices),
            "devices": [device.get_status() for device in self.devices.values()],
            "message_count": len(self.message_history)
        }

