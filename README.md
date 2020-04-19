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
今回はプロトタイプなので関係ないが、一時データ以外はDynamoDBでなくRDSが良い。  
RDS使う段階であればAWS RDS Proxyでやる。  
普通にGoでやれば良かったかも。    
