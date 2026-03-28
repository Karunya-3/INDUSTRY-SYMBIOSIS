import json
import urllib.request
import urllib.error

url = "http://localhost:5000/api/auth/login"

# Test login data
data = {
    "email": "test@example.com",
    "password": "Test12345"
}

print("Testing Login...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("-" * 50)

# Convert data to JSON and encode
json_data = json.dumps(data).encode('utf-8')

# Create request
req = urllib.request.Request(
    url,
    data=json_data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    # Send request
    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode('utf-8')
        result = json.loads(response_data)
        print(f"✅ Status Code: {response.getcode()}")
        print(f"Response: {json.dumps(result, indent=2)}")
        
        # Save token for later use
        if 'data' in result and 'access_token' in result['data']:
            token = result['data']['access_token']
            print(f"\n🔑 Access Token: {token[:50]}...")
            
            # Save token to file for testing
            with open('token.txt', 'w') as f:
                f.write(token)
            print("✅ Token saved to token.txt")
            
except urllib.error.HTTPError as e:
    print(f"❌ Status Code: {e.code}")
    error_data = e.read().decode('utf-8')
    print(f"Error Response: {json.dumps(json.loads(error_data), indent=2)}")
except Exception as e:
    print(f"Error: {e}")