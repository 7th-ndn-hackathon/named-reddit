/**
 * Copyright (C) 2017 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: From ndn-cxx security https://github.com/named-data/ndn-cxx/blob/master/src/security/pib/key.cpp
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/** @ignore */
var Name = require('../../name.js').Name; /** @ignore */
var CertificateV2 = require('../v2/certificate-v2.js').CertificateV2; /** @ignore */
var SyncPromise = require('../../util/sync-promise.js').SyncPromise;

/**
 * A PibKey provides access to a key at the second level in the PIB's 
 * Identity-Key-Certificate hierarchy. A PibKey object has a Name (identity +
 * "KEY" + keyId), and contains one or more CertificateV2 objects, one of which
 * is set as the default certificate of this key. A certificate can be directly
 * accessed by getting a CertificateV2 object.
 *
 * Create a PibKey which uses the impl backend implementation. This constructor
 * should only be called by PibKeyContainer.
 *
 * @param {PibKeyImpl} impl An object of a subclass of PibKeyImpl.
 * @constructor
 */
var PibKey = function PibKey(impl)
{
  this.impl_ = impl;
};

exports.PibKey = PibKey;

/**
 * Get the key name.
 * @return {Name} The key name. You must not modify the Key object. If you need
 * to modify it, make a copy.
 * @throws Error if the backend implementation instance is invalid.
 */
PibKey.prototype.getName = function() { return this.lock_().getName(); };

/**
 * Get the name of the identity this key belongs to.
 * @return {Name} The name of the identity. You must not modify the Key object.
 * If you need to modify it, make a copy.
 * @throws Error if the backend implementation instance is invalid.
 */
PibKey.prototype.getIdentityName = function()
{
  return this.lock_().getIdentityName();
};

/**
 * Get the key type.
 * @return {number} The key type as an int from the KeyType enum.
 * @throws Error if the backend implementation instance is invalid.
 */
PibKey.prototype.getKeyType = function() { return this.lock_().getKeyType(); };

/**
 * Get the public key encoding.
 * @return {Blob} The public key encoding.
 * @throws Error if the backend implementation instance is invalid.
 */
PibKey.prototype.getPublicKey = function() { return this.lock_().getPublicKey(); };

/**
 * Get the certificate with name certificateName.
 * @param {Name} certificateName The name of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns a copy of the
 * CertificateV2, or a promise rejected with Error if certificateName does not
 * match the key name (or if the backend implementation instance is invalid), or
 * a promise rejected with Pib.Error if the certificate does not exist.
 */
PibKey.prototype.getCertificatePromise = function(certificateName, useSync)
{
  try {
    return this.lock_().getCertificatePromise(certificateName, useSync);
  } catch (ex) {
    return SyncPromise.reject(ex);
  }
};

/**
 * Get the default certificate for this Key.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default
 * CertificateV2, or a promise rejected with Error if the backend implementation
 * instance is invalid, or a promise rejected with Pib.Error if the default
 * certificate does not exist.
 */
PibKey.prototype.getDefaultCertificatePromise = function(useSync)
{
  try {
    return this.lock_().getDefaultCertificatePromise(useSync);
  } catch (ex) {
    return SyncPromise.reject(ex);
  }
};

/**
 * Construct a key name based on the appropriate naming conventions.
 * @param {Name} identityName The name of the identity.
 * @param {Name.Component} keyId The key ID name component.
 * @return {Name} The constructed name as a new Name.
 */
PibKey.constructKeyName = function(identityName, keyId)
{
  var keyName = new Name(identityName);
  keyName.append(CertificateV2.KEY_COMPONENT).append(keyId);

  return keyName;
};

/**
 * Check if keyName follows the naming conventions for a key name.
 * @param {Name} keyName The name of the key.
 * @return {boolean} True if keyName follows the naming conventions, otherwise
 * false.
 */
PibKey.isValidKeyName = function(keyName)
{
  return keyName.size() > CertificateV2.MIN_KEY_NAME_LENGTH &&
         keyName.get(-CertificateV2.MIN_KEY_NAME_LENGTH).equals
           (CertificateV2.KEY_COMPONENT);
};

/**
 * Extract the identity namespace from keyName.
 * @param {Name} keyName The name of the key.
 * @return {Name} The identity name as a new Name.
 */
PibKey.extractIdentityFromKeyName = function(keyName)
{
  if (!PibKey.isValidKeyName(keyName))
    throw new Error("Key name `" + keyName.toUri() +
      "` does not follow the naming conventions");

  // Trim everything after and including "KEY".
  return keyName.getPrefix(-CertificateV2.MIN_KEY_NAME_LENGTH);
};

/**
 * Add the certificate. If a certificate with the same name (without implicit
 * digest) already exists, then overwrite the certificate. If no default
 * certificate for the key has been set, then set the added certificate as
 * default for the key. This should only be called by KeyChain.
 * @param {CertificateV2} certificate The certificate to add. This copies the
 * object.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when finished, or a
 * promise rejected with Error if the name of the certificate does not match the
 * key name.
 */
PibKey.prototype.addCertificatePromise_ = function(certificate, useSync)
{
  return this.lock_().addCertificatePromise(certificate, useSync);
};

/**
 * Remove the certificate with name certificateName. If the certificate does not
 * exist, do nothing. This should only be called by KeyChain.
 * @param {Name} certificateName The name of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which fulfills when finished, or a
 * promise rejected with Error if certificateName does not match the key name.
 */
PibKey.prototype.removeCertificatePromise_ = function(certificateName, useSync)
{
  return this.lock_().removeCertificatePromise(certificateName, useSync);
};

/**
 * Set the existing certificate with name certificateName as the default
 * certificate. This should only be called by KeyChain.
 * @param {Name} certificateName The name of the certificate.
 * @param {boolean} useSync (optional) If true then return a SyncPromise which
 * is already fulfilled. If omitted or false, this may return a SyncPromise or
 * an async Promise.
 * @return {Promise|SyncPromise} A promise which returns the default
 * CertificateV2, or a promise rejected with Error if certificateName does not
 * match the key name, or a promise rejected with Pib.Error if
 * certificateOrCertificateName is the certificate Name and the certificate does
 * not exist.
 */
PibKey.prototype.setDefaultCertificatePromise_ = function(certificateName, useSync)
{
  return this.lock_().setDefaultCertificatePromise(certificateName, useSync);
};

/**
 * Get the PibCertificateContainer in the PibKeyImpl. This should only be called
 * by KeyChain.
 * @return {PibCertificateContainer} The PibCertificateContainer.
 */
PibKey.prototype.getCertificates_ = function()
{
  return this.lock_().certificates_;
};

/**
 * Check the validity of the impl_ instance.
 * @return {PibKeyImpl} The PibKeyImpl when the instance is valid.
 * @throws Error if the backend implementation instance is invalid.
 */
PibKey.prototype.lock_ = function()
{
  if (this.impl_ == null)
    throw new Error("Invalid key instance");

  return this.impl_;
};
