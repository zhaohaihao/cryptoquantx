1. 工作区去内有2个工程，一个后端spring-boot工程，叫okx-trading，还一个前端react工程，叫cryptoquantx，这两个工程互相配合，比如我想实现前端某个功能改造，不仅要改造前端页面，还要查看对应后端接口是哪个，查看接口是否需要一起改造，每次进行对话自动判断是哪个工程要改造，去改对应的工程下的内容
2. 实现功能的时候先检查代码确认有无相同或类似的实现，比如类似功能的controller，service，repository等，直接在已有的类上更新，改造，如果没有类似的再进行新建，确保不要重复创建类似功能的类
3. 所有打印日志语句都要判断是否在开发环境下，根据.env 里面配置的参数去确定是否打印日志
4. bash -c curl -X GET 'http://localhost:8088/api/backtest/ta4j/run-all?endTime=2025-12-31%2023%3A59%3A59&feeRatio=0.001&initialAmount=100000&interval=1D&saveResult=true&startTime=2022-01-01%2000%3A00%3A00&symbol=BTC-USDT&threadCount=4' -H 'accept: */*'  这样调用批量回测接口，是可行的
5. 涉及价格的，保持红涨绿跌的颜色风格