# Encryptable Concern
# Provides AES-256-GCM encryption for PII (Personally Identifiable Information) fields
# and blind index support for searchable/unique encrypted fields
#
# Usage:
#   class User < ApplicationRecord
#     include Encryptable
#     encrypts_pii :email, :name, :name_kana, :birth_date
#     blind_index :email  # Enables search and uniqueness validation
#   end

module Encryptable
  extend ActiveSupport::Concern

  included do
    # Track fields with blind indexes
    class_attribute :blind_indexed_fields, default: []

    # Helper method to encrypt multiple PII fields at once
    # Uses attr_encrypted with AES-256-GCM encryption
    def self.encrypts_pii(*attributes)
      # Convert hex key to binary (32 bytes for AES-256)
      key_bytes = [ ENCRYPTION_KEY ].pack("H*")

      attributes.each do |attribute|
        attr_encrypted attribute, {
          key: key_bytes,
          algorithm: "aes-256-gcm",
          encode: true,
          encode_iv: true,
          # Map to schema column names: {attribute}_encrypted and {attribute}_encrypted_iv
          attribute: "#{attribute}_encrypted",
          iv_attribute: "#{attribute}_encrypted_iv"
        }
      end
    end

    # Creates a blind index for an encrypted field
    # This enables secure search and uniqueness validation on encrypted data
    #
    # Usage:
    #   blind_index :email
    #
    # This will:
    #   - Compute HMAC-SHA256 hash of the value before save
    #   - Store it in {field}_bidx column
    #   - Provide find_by_{field} class method
    def self.blind_index(attribute, **options)
      bidx_column = options[:bidx_attribute] || "#{attribute}_bidx"

      # Track this field
      self.blind_indexed_fields = blind_indexed_fields + [ attribute.to_sym ]

      # Before validation callback to compute blind index (needed for presence validation)
      before_validation :"compute_#{attribute}_blind_index", if: -> { send("#{attribute}_changed?") || send(bidx_column).blank? }

      # Define method to compute blind index
      define_method("compute_#{attribute}_blind_index") do
        value = send(attribute)
        if value.present?
          send("#{bidx_column}=", self.class.compute_blind_index(value))
        else
          send("#{bidx_column}=", nil)
        end
      end

      # Check if attribute changed (for encrypted fields)
      define_method("#{attribute}_changed?") do
        encrypted_attr = "#{attribute}_encrypted"
        if respond_to?("#{encrypted_attr}_changed?")
          send("#{encrypted_attr}_changed?")
        else
          # For new records or when we can't detect changes
          new_record? || changes.key?(encrypted_attr) || changes.key?(attribute.to_s)
        end
      end

      # Define class method to find by this attribute
      # Use Arel to safely query with dynamic column names
      define_singleton_method("find_by_#{attribute}") do |value|
        return nil if value.blank?
        validate_bidx_column!(bidx_column)
        bidx = compute_blind_index(value)
        where(arel_table[bidx_column].eq(bidx)).first
      end

      # Define class method to find by this attribute (with exception)
      define_singleton_method("find_by_#{attribute}!") do |value|
        result = send("find_by_#{attribute}", value)
        raise ActiveRecord::RecordNotFound, "Couldn't find #{name} with #{attribute}=#{value}" unless result
        result
      end

      # Define scope to search by this attribute
      # Use Arel to safely query with dynamic column names
      scope "by_#{attribute}", ->(value) {
        return none if value.blank?
        validate_bidx_column!(bidx_column)
        where(arel_table[bidx_column].eq(compute_blind_index(value)))
      }
    end

    # Validate that the blind index column exists in the table
    # Prevents SQL injection by ensuring only valid column names are used
    def self.validate_bidx_column!(column_name)
      unless column_names.include?(column_name.to_s)
        raise ArgumentError, "Invalid blind index column: #{column_name}"
      end
    end

    # Compute blind index hash for a value
    # Uses HMAC-SHA256 with a separate key from encryption
    def self.compute_blind_index(value)
      return nil if value.blank?

      # Normalize the value (downcase for case-insensitive matching)
      normalized = value.to_s.downcase.strip

      # Use HMAC-SHA256 for the blind index
      key_bytes = [ BLIND_INDEX_KEY ].pack("H*")
      OpenSSL::HMAC.hexdigest("SHA256", key_bytes, normalized)
    end
  end

  # Instance methods for checking if fields are encrypted
  def encrypted?(attribute)
    encrypted_attribute = "#{attribute}_encrypted"
    respond_to?(encrypted_attribute) && send(encrypted_attribute).present?
  end

  # Instance method to compute blind index
  def compute_blind_index(value)
    self.class.compute_blind_index(value)
  end
end
