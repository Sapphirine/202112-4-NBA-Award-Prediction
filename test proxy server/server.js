const {BigQuery} = require('@google-cloud/bigquery');
const bodyParser = require('body-parser')
const bigquery = new BigQuery();
const express = require('express')
const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');
const cors = require('cors');
const app = express()
app.use(bodyParser.json());

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));

/*************** 5000 port server 请求球员数据 ***************/
app.use((request,response,next)=>{
	console.log('有人请求服务器1(球员姓名)了');
	next()
})

app.get('/playerStatistic', async (request,response)=>{
	let playerName = decodeURI(request.url).split('?')[1].split('=')[1].split('+').join(' ');

	const playerStatistics = await query(playerName, 5000, 'player_information');
	// 取小数点后1位
	StatisticFix(playerStatistics);
	response.send(playerStatistics[0]);
})

app.listen(5000,(err)=>{
	if(!err) console.log('服务器1(球员姓名)启动成功了,请求球员卡信息地址为：http://localhost:5000/playerStatistic');
})

/*************** 5001 port server 请求球员姓名补全 ***************/
app.use((request,response,next)=>{
	console.log('有人请求服务器2(球员名字)了');
	next()
})

app.post('/playerName', async (request,response)=>{
	const nameKey = request.body.name;

	const playerNames = await query(nameKey, 5001, 'player_information');

	response.send(playerNames)
})

app.listen(5001,(err)=>{
	if(!err) console.log('服务器2(球员名字)启动成功了,请求补全球员名字地址为：http://localhost:5001/playerName');
})

/*************** 5002 port server 请求预测结果 ***************/
app.use((request,response,next)=>{
	console.log('有人请求 predictionStatistic 了');
	next()
})

app.post('/predictionStatistic', async (request,response)=>{
	const predictionStatistic = request.body;
	// 新逻辑：对一个算好概率的的新表查询，params是一个对象，包含日期，球员id和要检索的奖项
	const curDate = new Date();
	const curDay = getCurDay(curDate);
	const params = {
		date: curDay,
		name: predictionStatistic.name,
		prize: predictionStatistic.predPrize
	}
	const prizePercentage = await query(params, 5002, `${predictionStatistic.predPrize}_prediction_results`);
	const percentage = JSON.stringify(prizePercentage[0][`${predictionStatistic.predPrize}_prediction`]);
	// setTimeout(() => {response.send(percentage)}, 2000);
	response.send(percentage);
})

app.listen(5002,(err)=>{
	if(!err) console.log('/predictionStatistic 接口启动了，地址为：http://localhost:5002/predictionStatistic');
})

/*************** 5003 port server login ***************/
// 解析前端发送的请求的参数
app.use(bodyParser.json());
// 使用 cookieParser 中间件
app.use(cookieParser());
app.use((request,response,next)=>{
	console.log('有人请求 loginVerification 了');
	next()
})
app.post('/loginVerification', async (request,response)=>{
	// cookie中存最近的登陆人账号密码，当同一个人在一段时间内连续登陆时，不用上数据库查找
	const { accountNumber, passWord } = request.body;
	// 1表示账号错误，2表示密码错误，3表示成功

	/*************** 缓存数据到cookie中 ***************/
	if(request.cookies.account && request.cookies.password) {  // cookie中有缓存的账号密码，直接读取，不作查询
		// console.log(request.cookies);
		if(request.cookies.account === accountNumber && request.cookies.password === passWord) {  // 都命中
			response.send('3'); // 直接传，不用上数据库搜索了
		} else if(request.cookies.account === accountNumber && request.cookies.password !== passWord) { // 账号对了，密码不对
			response.send('2'); // 也直接传，不用上数据库搜索
		} else {
			const SQLpassword = await query(accountNumber, 5003, 'account_information');
			if(!SQLpassword.length) response.send('1');
			else if(SQLpassword[0].password !== passWord) {
				response.send('2');
			} else {
				response.cookie('account', accountNumber, { maxAge: 60 * 1000, httpOnly: true });
				response.cookie('password', passWord, { maxAge: 60 * 1000, httpOnly: true });
				response.send('3');
			}
		}
	} else { // cookie中没有记住的账号密码，或者存了但是没有匹配的账号时，上数据库查询，并在成功查到时更新cookie
		const SQLpassword = await query(accountNumber, 5003, 'account_information');
		if(!SQLpassword.length) response.send('1');
		else if(SQLpassword[0].password !== passWord) {
			response.send('2');
		} else {
			response.cookie('account', accountNumber, { maxAge: 60 * 1000, httpOnly: true });
			response.cookie('password', passWord, { maxAge: 60 * 1000, httpOnly: true });
			response.send('3');
		}
	}
	/************************ 传统方法 ***************************/
	// const SQLpassword = await query(accountNumber, 5003);
	// if(!SQLpassword.length) response.send('1');
	// else {
	// 	response.send(SQLpassword[0].password === passWord ? '3' : '2');
	// }
})

app.listen(5003,(err)=>{
	if(!err) console.log('/loginVerification 接口启动了，地址为：http://localhost:5003/loginVerification');
})

/*************** 5004 port server signup ***************/
app.use((request,response,next)=>{
	console.log('有人请求 signup 了');
	next()
})

app.post('/signup', async (request,response)=>{
	const { accountNumber, passWord } = request.body;

	// 判断是否有重复账号
	const SQLpassword = await query(accountNumber, 5003, 'account_information');
	// 有重复账号
	if(SQLpassword.length) response.send('2');
	else { // 没有重复账号
		// 插入帐号到bigquery中
		const rows = [{
			id: uuid(),
			account: accountNumber,
			password: passWord
		}];
		const isInserted = addToTable(rows, '6893project', 'account_information');
		// 1表示注册成功，3表示注册失败
		response.send(isInserted ? '1' : '3');
	}
})

app.listen(5004,(err)=>{
	if(!err) console.log('/signup 接口启动了，地址为：http://localhost:5004/signup');
})


/*************** functions ***************/
// Search player information
async function query(params, port, tableId) {
	let query;
	switch(port) {
		case 5000:
			// Processing name with'influence SQL search
			params = handleColon(params);
			// query player information from name
			query = `SELECT * FROM \`bigdataproject-335101.6893project.${tableId}\` WHERE name = \'${params}\' LIMIT 100`;
			break;
		case 5001:
			// Processing name with'influence SQL search
			params = handleColon(params);
			// query player information from key of name
			query = `SELECT id, name, src FROM \`bigdataproject-335101.6893project.${tableId}\` WHERE lower(name) LIKE lower(\'%${params}%\') LIMIT 10`;
			break;
		case 5002:
			let prize = params.prize;
			// Processing name with'influence SQL search
			let name = handleColon(params.name);
			let date = params.date;
			query = `SELECT ${prize}_prediction FROM \`bigdataproject-335101.6893project.${tableId}\` WHERE name = \'${name}\' AND date = \'${date}\' LIMIT 100`;
			break;
		case 5003:
			query = `SELECT password FROM \`bigdataproject-335101.6893project.${tableId}\` WHERE account = \'${params}\'`;
			break;
	}

    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'us-east1',
    };
  
    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
  
    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

	let arr = [];
	rows.forEach(row => {
        arr.push(row);
    });
	return arr;
}

// 插入到bigquery表格
async function addToTable(rows, datasetId, tableId) {
	await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(rows);
	
	console.log(`Inserted ${rows.length} rows`);
	return true;
}

// 修改小数点位数
function StatisticFix(arr) {
	let obj = arr[0];
	for(let key in obj) {
		if(typeof(obj[key]) === 'number') obj[key] = parseFloat(obj[key].toFixed(1));
	}
}

// 处理名字中带有冒号'影响SQL查询的问题
function handleColon(name) {
	let i = 0;
	while(name.charAt(i)) {
		if(name.charAt(i) === '\'') {
			name = name.slice(0, i) + '\\' + name.slice(i);
			i++;
		}
		i++;
	}
	return name;
}

// 由今日new Date()得到 YYYY/MM/DD 格式的字符串
function getCurDay(date) {
	// 返回要获取的数据的日期，格式YYYY/MM/DD
	let curDay;
	// 今日的时间戳
	let curTimeStamp;
	// 获取今日零点
	const todayZero = new Date().setHours(0, 0, 0, 0);
	// 获取今日凌晨5点时间
	const todayFive = new Date().setHours(0, 0, 0, 0) + 5 * 60 * 60 * 1000;
	// 获取当前时间
	const curTime = new Date().getTime();
	// 如果当前时间在0点到5点之间，设置为获取昨日日期
	curTimeStamp = curTime < todayFive ? curTime - 24 * 60 * 60 * 1000 : curTime;
	// 获取当天日期
	const today = new Date(curTimeStamp);
	const curYear = today.getFullYear().toString();
	const curMonth = (today.getMonth() + 1).toString();
	const curDate = today.getDate();

	curDay = curYear + '-' + curMonth + '-' + curDate;
	return curDay;
}