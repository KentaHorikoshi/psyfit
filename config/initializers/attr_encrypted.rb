# AttrEncrypted Configuration for PII Encryption
# Uses AES-256-GCM for secure encryption of sensitive patient data

# Encryption key configuration
# In production, this MUST be set via environment variable
# In test, we use a fixed key for consistent testing
ENCRYPTION_KEY = if Rails.env.test?
  # Fixed key for testing (32 bytes = 64 hex characters)
  '5d45d66ca414ee68450053a3d4e6d2703af2a7264871b6d098d8f69f8190d234'
elsif Rails.env.development?
  # Development key (should be unique per developer)
  ENV.fetch('ATTR_ENCRYPTED_KEY') do
    # Generate one if not set
    '5d45d66ca414ee68450053a3d4e6d2703af2a7264871b6d098d8f69f8190d234'
  end
else
  # Production MUST have ATTR_ENCRYPTED_KEY set
  ENV.fetch('ATTR_ENCRYPTED_KEY') do
    raise 'ATTR_ENCRYPTED_KEY environment variable must be set in production'
  end
end

# Validate key length (must be 32 bytes for AES-256)
if ENCRYPTION_KEY.bytesize != 64
  raise "ATTR_ENCRYPTED_KEY must be 64 hex characters (32 bytes) for AES-256-GCM, got #{ENCRYPTION_KEY.bytesize}"
end

# Blind Index Key Configuration
# Used for HMAC-SHA256 hashing to enable search and uniqueness validation on encrypted fields
# This MUST be a separate key from the encryption key for security
BLIND_INDEX_KEY = if Rails.env.test?
  # Fixed key for testing (32 bytes = 64 hex characters)
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
elsif Rails.env.development?
  ENV.fetch('BLIND_INDEX_KEY') do
    'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
  end
else
  ENV.fetch('BLIND_INDEX_KEY') do
    raise 'BLIND_INDEX_KEY environment variable must be set in production'
  end
end

if BLIND_INDEX_KEY.bytesize != 64
  raise "BLIND_INDEX_KEY must be 64 hex characters (32 bytes), got #{BLIND_INDEX_KEY.bytesize}"
end
