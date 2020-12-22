# oauth-bound-access-demo
Oauth 2.0 mtls bound access flows using openid-client.

This project demonsrate the usage of MTLS for OAuth2.0 Client Authentication and for bounding access token to specific client certificate (https://tools.ietf.org/html/rfc8705).
 
use "key" environment variable to set private key (in base64)
use "cert" environment variable to set matching certificate (in base64)
this demo uses CA-signed certificate 
to enable self-signed, set token_endpoint_auth_method=self_signed_tls_client_auth

