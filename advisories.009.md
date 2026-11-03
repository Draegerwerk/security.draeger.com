### [Dräger ServiceConnect Client security vulnerability: stored proxy credentials](<advisories/2019-05-07_Draeger_ServiceConnect_Security_Advisory.pdf>)

PSA-19-002-1 · 2019-05-07

The Dräger ServiceConnect Client keeps proxy server credentials unencrypted on the hard disk. An attacker with access to the hard disk can read the Windows logon credentials of the user. All software versions up to and including 3.7.0.144 are affected. Dräger gave a fixed version in May 2019. Users must update, remove the stored credentials, and change them.
