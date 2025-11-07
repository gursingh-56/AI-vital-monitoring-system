"""
API Server for Bluetooth Mesh Simulation
Provides endpoints for mesh operations and data transfer
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from mesh_simulation.mesh_network import MeshNetwork
from mesh_simulation.device import MeshDevice
from mesh_simulation.data_transfer import DataTransfer
import uuid
import os

app = Flask(__name__)
CORS(app)

# Initialize mesh network and data transfer
mesh_network = MeshNetwork(network_id="main_mesh")
data_transfer = DataTransfer()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "bluetooth_mesh_simulation"}), 200


@app.route('/api/mesh/devices', methods=['GET'])
def get_devices():
    """Get all devices in the mesh network"""
    devices = [device.get_status() for device in mesh_network.devices.values()]
    return jsonify({
        "devices": devices,
        "count": len(devices)
    }), 200


@app.route('/api/mesh/devices', methods=['POST'])
def create_device():
    """Create a new device in the mesh network"""
    data = request.get_json() or {}
    device_id = data.get('device_id') or str(uuid.uuid4())
    name = data.get('name')
    
    if device_id in mesh_network.devices:
        return jsonify({"error": "Device already exists"}), 400
        
    device = MeshDevice(device_id=device_id, name=name)
    mesh_network.add_device(device)
    
    return jsonify({
        "message": "Device created successfully",
        "device": device.get_status()
    }), 201


@app.route('/api/mesh/devices/<device_id>', methods=['GET'])
def get_device(device_id):
    """Get a specific device"""
    device = mesh_network.get_device(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 404
    return jsonify(device.get_status()), 200


@app.route('/api/mesh/devices/<device_id>', methods=['DELETE'])
def delete_device(device_id):
    """Remove a device from the mesh network"""
    if mesh_network.remove_device(device_id):
        return jsonify({"message": "Device removed successfully"}), 200
    return jsonify({"error": "Device not found"}), 404


@app.route('/api/mesh/connect', methods=['POST'])
def connect_devices():
    """Connect two devices in the mesh"""
    data = request.get_json()
    if not data or 'device1' not in data or 'device2' not in data:
        return jsonify({"error": "device1 and device2 are required"}), 400
        
    device1_id = data['device1']
    device2_id = data['device2']
    
    device1 = mesh_network.get_device(device1_id)
    if not device1:
        return jsonify({"error": f"Device {device1_id} not found"}), 404
        
    if device1.connect_to_device(device2_id):
        return jsonify({
            "message": "Devices connected successfully",
            "device1": device1.get_status(),
            "device2": mesh_network.get_device(device2_id).get_status()
        }), 200
    else:
        return jsonify({"error": "Failed to connect devices"}), 400


@app.route('/api/mesh/disconnect', methods=['POST'])
def disconnect_devices():
    """Disconnect two devices"""
    data = request.get_json()
    if not data or 'device1' not in data or 'device2' not in data:
        return jsonify({"error": "device1 and device2 are required"}), 400
        
    device1_id = data['device1']
    device2_id = data['device2']
    
    device1 = mesh_network.get_device(device1_id)
    if not device1:
        return jsonify({"error": f"Device {device1_id} not found"}), 404
        
    if device1.disconnect_from_device(device2_id):
        return jsonify({"message": "Devices disconnected successfully"}), 200
    else:
        return jsonify({"error": "Failed to disconnect devices"}), 400


@app.route('/api/mesh/send', methods=['POST'])
def send_message():
    """Send a message between devices"""
    data = request.get_json()
    if not data or 'source' not in data or 'destination' not in data:
        return jsonify({"error": "source, destination, and payload are required"}), 400
        
    source_id = data['source']
    destination_id = data['destination']
    message_type = data.get('message_type', 'data')
    payload = data.get('payload', '')
    
    source_device = mesh_network.get_device(source_id)
    if not source_device:
        return jsonify({"error": f"Source device {source_id} not found"}), 404
        
    if source_device.send_message(destination_id, message_type, payload):
        return jsonify({
            "message": "Message sent successfully",
            "source": source_id,
            "destination": destination_id
        }), 200
    else:
        return jsonify({"error": "Failed to send message"}), 400


@app.route('/api/mesh/messages/<device_id>', methods=['GET'])
def get_messages(device_id):
    """Get received messages for a device"""
    device = mesh_network.get_device(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 404
        
    messages = [{
        "message_id": msg.message_id,
        "source": msg.source_address,
        "destination": msg.destination_address,
        "type": msg.message_type,
        "payload": msg.payload,
        "timestamp": msg.timestamp
    } for msg in device.received_messages]
    
    return jsonify({
        "device_id": device_id,
        "messages": messages,
        "count": len(messages)
    }), 200


@app.route('/api/mesh/status', methods=['GET'])
def get_network_status():
    """Get mesh network status"""
    return jsonify(mesh_network.get_network_status()), 200


@app.route('/api/transfer/text', methods=['POST'])
def transfer_text():
    """Transfer text data to an IP address"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
        
    target_ip = data.get('target_ip')
    port = data.get('port', 80)
    endpoint = data.get('endpoint', '/api/data')
    text_data = data.get('data')
    
    if not target_ip or not text_data:
        return jsonify({"error": "target_ip and data are required"}), 400
        
    result = data_transfer.send_text(target_ip, port, endpoint, text_data, 
                                    headers=data.get('headers'))
    
    status_code = 200 if result.get('success') else 500
    return jsonify(result), status_code


@app.route('/api/transfer/file', methods=['POST'])
def transfer_file():
    """Transfer a file to an IP address"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    target_ip = request.form.get('target_ip')
    port = int(request.form.get('port', 80))
    endpoint = request.form.get('endpoint', '/api/upload')
    
    if not target_ip:
        return jsonify({"error": "target_ip is required"}), 400
        
    # Save uploaded file temporarily
    temp_dir = 'temp_uploads'
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)
    
    try:
        result = data_transfer.send_file(target_ip, port, endpoint, temp_path,
                                        headers=request.form.get('headers'))
        status_code = 200 if result.get('success') else 500
        return jsonify(result), status_code
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/api/transfer/history', methods=['GET'])
def get_transfer_history():
    """Get transfer history"""
    return jsonify({
        "history": data_transfer.get_transfer_history(),
        "count": len(data_transfer.get_transfer_history())
    }), 200


if __name__ == '__main__':
    print("Starting Bluetooth Mesh Simulation API Server...")
    print("API endpoints available at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

