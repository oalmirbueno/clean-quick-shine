# Templates de deep links (preencher antes do release)

Publicar em `public/.well-known/` **depois** de preencher os valores reais —
não publicar com placeholders.

## Android — `public/.well-known/assetlinks.json`

Pegue o SHA-256 do certificado de release no Play Console
(Configuração → Integridade do app → Assinatura de apps) e substitua abaixo:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "br.com.jalimpo.app",
      "sha256_cert_fingerprints": ["SUBSTITUIR:PELO:SHA256:DO:CERT:DE:RELEASE"]
    }
  }
]
```

## iOS — `public/.well-known/apple-app-site-association`

Substitua `TEAMID` pelo Team ID da conta Apple Developer (formato `ABCDE12345`).
Servir como `application/json`, sem extensão `.json` no nome do arquivo.

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.br.com.jalimpo.app",
        "paths": ["*"]
      }
    ]
  }
}
```

## Depois de publicar

- Android: `adb shell pm verify-app-links --re-verify br.com.jalimpo.app`
- iOS: validar em https://app-site-association.cdn-apple.com/a/v1/jalimpo.com
