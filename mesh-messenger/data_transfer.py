"""
Data Transfer Module for sending data to IP addresses
"""
import requests
import os
from typing import Optional, Dict, Any
from pathlib import Path


class DataTransfer:
    """Handles data transfer to IP addresses"""
    
    def __init__(self):
        self.transfer_history: List[Dict] = []
        
    def send_text(self, target_ip: str, port: int, endpoint: str, text_data: str, 
                  headers: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Send text data to a target IP address
        
        Args:
            target_ip: Target IP address
            port: Port number
            endpoint: API endpoint path (e.g., '/api/data')
            text_data: Text data to send
            headers: Optional headers
            
        Returns:
            Dictionary with success status and response details
        """
        url = f"http://{target_ip}:{port}{endpoint}"
        
        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'BluetoothMeshSimulator/1.0'
        }
        
        if headers:
            default_headers.update(headers)
            
        payload = {
            "data": text_data,
            "type": "text",
            "source": "mesh_simulation"
        }
        
        try:
            response = requests.post(url, json=payload, headers=default_headers, timeout=10)
            
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response_text": response.text,
                "url": url,
                "data_sent": text_data[:100] + "..." if len(text_data) > 100 else text_data
            }
            
            self.transfer_history.append({
                "type": "text",
                "target": url,
                "result": result,
                "timestamp": __import__('time').time()
            })
            
            return result
            
        except requests.exceptions.RequestException as e:
            result = {
                "success": False,
                "error": str(e),
                "url": url
            }
            
            self.transfer_history.append({
                "type": "text",
                "target": url,
                "result": result,
                "timestamp": __import__('time').time()
            })
            
            return result
            
    def send_file(self, target_ip: str, port: int, endpoint: str, file_path: str,
                  headers: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Send a file to a target IP address
        
        Args:
            target_ip: Target IP address
            port: Port number
            endpoint: API endpoint path (e.g., '/api/upload')
            file_path: Path to the file to send
            headers: Optional headers
            
        Returns:
            Dictionary with success status and response details
        """
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }
            
        url = f"http://{target_ip}:{port}{endpoint}"
        
        default_headers = {
            'User-Agent': 'BluetoothMeshSimulator/1.0'
        }
        
        if headers:
            default_headers.update(headers)
            
        try:
            file_name = os.path.basename(file_path)
            
            with open(file_path, 'rb') as f:
                files = {'file': (file_name, f, 'application/octet-stream')}
                data = {
                    'type': 'file',
                    'source': 'mesh_simulation',
                    'filename': file_name
                }
                
                response = requests.post(url, files=files, data=data, 
                                        headers=default_headers, timeout=30)
                
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response_text": response.text,
                "url": url,
                "file_sent": file_name,
                "file_size": os.path.getsize(file_path)
            }
            
            self.transfer_history.append({
                "type": "file",
                "target": url,
                "file": file_name,
                "result": result,
                "timestamp": __import__('time').time()
            })
            
            return result
            
        except requests.exceptions.RequestException as e:
            result = {
                "success": False,
                "error": str(e),
                "url": url,
                "file_path": file_path
            }
            
            self.transfer_history.append({
                "type": "file",
                "target": url,
                "file": file_path,
                "result": result,
                "timestamp": __import__('time').time()
            })
            
            return result
            
    def get_transfer_history(self) -> List[Dict]:
        """Get transfer history"""
        return self.transfer_history

