# oauth-bound-access-demo
OAuth 2.0 mtls bound access flows using openid-client.

This project demonstrates the usage of MTLS for OAuth2.0 Client Authentication and for bounding access tokens to a specific client certificate (https://tools.ietf.org/html/rfc8705).


mTLS Configuration

* make sure to provide CA-signed certificate
  * to enable self-signed certificates, set token_endpoint_auth_method=self_signed_tls_client_auth
* define "mtls_privatekey" environment variable to set private key (base64 encoded PEM foramt - single line). 
* define "mtls-cert" environment variable to set matching certificate (base64 encoded PEM foramt - single line).

OAUTH 2.0 Configuration  

* define "oauth_clientid" environment variable to set your oauth 2.0 client-id
  * client id is required for the MTLS based flow. 
* define "oauth_redirecturi" environment variable to set your oauth callback
* define "oauth_wellknown" environment variable to define your Authorization Server discovery endpoint 

 

