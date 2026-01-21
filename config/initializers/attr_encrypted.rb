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
