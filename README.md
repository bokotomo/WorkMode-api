# WorkMode-api

```
wscat -c wss://~~~

{"action":"sendmessage", "data":"hello world"}
```

## Upload

```
npm run deploy
```

## FRONT

https://github.com/bokotomo/WorkMode-front

## メモ

今回はプロトタイプなので関係ないが、一時データ以外は DynamoDB でなく RDS が良い。  
RDS 使う段階であれば AWS RDS Proxy でやる。  
普通に Go でやれば良かったかも。  
eslint もつけてない。
