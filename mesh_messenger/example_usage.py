import requests
import time
import json
API_BASE = "http://localhost:5000"
def print_response(response, title=""):
    if title:
        print(f"\n{'='*50}")
        print(f"{title}")
        print(f"{'='*50}")
    print(json.dumps(response.json(), indent=2))
def example_manual_simulation():
    print("\n" + "="*60)
    print("Bluetooth Mesh Simulation - Manual Example")
    print("="*60)
    print("\n[Step 1] Creating devices...")
    device1 = requests.post(f"{API_BASE}/api/mesh/devices", json={
        "device_id": "device_001",
        "name": "Device Alpha"
    })
    print_response(device1, "Device 1 Created")
    device2 = requests.post(f"{API_BASE}/api/mesh/devices", json={
        "device_id": "device_002",
        "name": "Device Beta"
    })
    print_response(device2, "Device 2 Created")
    print("\n[Step 2] Connecting devices...")
    connect = requests.post(f"{API_BASE}/api/mesh/connect", json={
        "device1": "device_001",
        "device2": "device_002"
    })
    print_response(connect, "Devices Connected")
    print("\n[Step 3] Sending message from Device 1 to Device 2...")
    message = requests.post(f"{API_BASE}/api/mesh/send", json={
        "source": "device_001",
        "destination": "device_002",
        "message_type": "data",
        "payload": "Hello from Device Alpha!"
    })
    print_response(message, "Message Sent")
    time.sleep(0.5)
    print("\n[Step 4] Checking messages on Device 2...")
    messages = requests.get(f"{API_BASE}/api/mesh/messages/device_002")
    print_response(messages, "Messages on Device 2")
    print("\n[Step 5] Transferring text data to external IP...")
    print("Note: This will attempt to send to the provided IP address")
    print("Example: target_ip='192.168.1.100', port=8080, endpoint='/api/data'")
    text_transfer = requests.post(f"{API_BASE}/api/transfer/text", json={
        "target_ip": "192.168.1.100",
        "port": 8080,
        "endpoint": "/api/data",
        "data": "Sample text data from mesh simulation"
    })
    print_response(text_transfer, "Text Transfer Result")
    print("\n[Step 6] Getting network status...")
    status = requests.get(f"{API_BASE}/api/mesh/status")
    print_response(status, "Network Status")
    print("\n[Step 7] Getting transfer history...")
    history = requests.get(f"{API_BASE}/api/transfer/history")
    print_response(history, "Transfer History")
def example_file_transfer():
    print("\n" + "="*60)
    print("File Transfer Example")
    print("="*60)
    sample_file = "sample_data.txt"
    with open(sample_file, 'w') as f:
        f.write("This is sample data from Bluetooth Mesh Simulation\n")
        f.write("Line 2 of sample data\n")
        f.write("Line 3 of sample data\n")
    print(f"\nCreated sample file: {sample_file}")
    with open(sample_file, 'rb') as f:
        files = {'file': (sample_file, f, 'text/plain')}
        data = {
            'target_ip': '192.168.1.100',
            'port': '8080',
            'endpoint': '/api/upload'
        }
        response = requests.post(f"{API_BASE}/api/transfer/file",
                               files=files, data=data)
        print_response(response, "File Transfer Result")
if __name__ == "__main__":
    print("\nMake sure the API server is running (python api_server.py)")
    print("Press Enter to continue...")
    input()
    try:
        health = requests.get(f"{API_BASE}/api/health")
        if health.status_code == 200:
            example_manual_simulation()
        else:
            print("Server is not responding correctly")
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to API server at {API_BASE}")
        print("Please start the server first: python api_server.py")
    except Exception as e:
        print(f"Error: {e}")
