# Encryptable Concern
# Provides AES-256-GCM encryption for PII (Personally Identifiable Information) fields
#
# Usage:
#   class User < ApplicationRecord
#     include Encryptable
#     encrypts_pii :email, :name, :name_kana, :birth_date
#   end

module Encryptable
  extend ActiveSupport::Concern

  included do
    # Setup encryption options
    def self.encryption_options
      {
        key: ENCRYPTION_KEY,
        algorithm: 'aes-256-gcm',
        mode: :per_attribute_iv_and_salt,
        insecure_mode: false,
        encode: true,
        encode_iv: true
      }
    end

    # Helper method to encrypt multiple PII fields at once
    def self.encrypts_pii(*attributes)
      attributes.each do |attribute|
        attr_encrypted attribute, encryption_options
      end
    end
  end

  # Instance methods for checking if fields are encrypted
  def encrypted?(attribute)
    encrypted_attribute = "#{attribute}_encrypted"
    respond_to?(encrypted_attribute) && send(encrypted_attribute).present?
  end
end
