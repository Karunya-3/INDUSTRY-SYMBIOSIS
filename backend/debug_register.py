import requests
import json

url = "http://localhost:5000/api/auth/register"

# Test data - make sure all fields match exactly what backend expects
data = {
    "email": "test@example.com",
    "password": "Test12345",
    "user_type": "factory",
    "company_name": "Test Factory",
    "industry": "Manufacturing",
    "location": "New York, USA"
}

print("Sending registration request...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("-" * 50)

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")