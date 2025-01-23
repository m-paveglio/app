from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization.pkcs12 import serialize_key_and_certificates
import datetime

# Gerar uma chave privada
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)

# Criar um certificado autoassinado
subject = issuer = x509.Name([
    x509.NameAttribute(NameOID.COUNTRY_NAME, "BR"),
    x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Test"),
    x509.NameAttribute(NameOID.LOCALITY_NAME, "Test"),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Test"),
    x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
])
cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(
    private_key.public_key()
).serial_number(
    x509.random_serial_number()
).not_valid_before(
    datetime.datetime.utcnow()
).not_valid_after(
    datetime.datetime.utcnow() + datetime.timedelta(days=365)
).sign(private_key, hashes.SHA256(), default_backend())

# Gerar o arquivo PFX
pfx = serialize_key_and_certificates(
    name=b"Certificado Teste",
    key=private_key,
    cert=cert,
    cas=None,
    encryption_algorithm=serialization.BestAvailableEncryption(b"minha_senha")
)

# Salvar a chave privada, certificado e o PFX em arquivos
with open("private.key", "wb") as key_file:
    key_file.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ))

with open("certificado.crt", "wb") as cert_file:
    cert_file.write(cert.public_bytes(serialization.Encoding.PEM))

with open("certificado.pfx", "wb") as pfx_file:
    pfx_file.write(pfx)
