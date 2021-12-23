import React, { Component } from 'react'
import PubSub from 'pubsub-js'
// 导入集中管理的url路径
import URL from '@/request/url'
// 导入axios请求，重命名为：$axios
import $axios from '@/request'
import './index.css'

export default class PredictionLeftBar extends Component {
    state = {
        // 当前选中的选项序号
        currentIndex: 0,
        // 标记现在是不是正在搜索
        isPrediction: false,
        // 正在搜索的图标
        isSearchingIconOpacity: 0
    }

    componentDidMount() {
        // 订阅更改选中的项目的消息
        PubSub.subscribe('set-selected-index', (_, data) => {
            this.setState({ currentIndex: data[0], isPrediction: data[1] });
        })
    }

    setCurrentIndex = (event) => {
        const { isPrediction } = this.state;
        // 如果出于未搜索状态才执行搜索
        if(!isPrediction) {
            // 将搜索状态设置为正在搜索
            this.setState({ isPrediction: true });
            // 获取当前点的是哪一个li索引
            let itemIndex = parseInt(event.currentTarget.getAttribute('index'), 10);
            // 获取当前选中的奖项名称
            let itemPrize = event.currentTarget.firstElementChild.nextElementSibling.innerHTML;
            // 获取当前选中的奖项icon类
            let itemIcon = event.currentTarget.firstElementChild.getAttribute('class');
            // 将选中的li添加active类使其高亮
            this.setState({ currentIndex: itemIndex });
            // 更新选中的奖项
            this.props.setCurrentPrize(itemPrize, itemIcon);
            // 清空展示图像中的数据条
            this.props.clearFigure();
            // 执行查询预测结果函数
            setTimeout(() => { this.sendPrediction(itemIndex) }, 500);
        } else {  // 如果正在搜索，显示正在搜索的图标
            this.setState({ isSearchingIconOpacity: 1 });
            if(window.predictionTimeOut) clearTimeout(window.predictionTimeOut);
            window.predictionTimeOut = setTimeout(() => {
                this.setState({ isSearchingIconOpacity: 0 });
            }, 3000);
            
        }
    }

    // 查询预测结果函数
    sendPrediction = (itemIndex) => {
        const { playerStatistic } = this.props;
        // true表示正在查询，显示加载动画
        this.props.setPredictingStatus(true);
        // 设置缓存预测数据的键名
        let playerOfpredictionResult = playerStatistic.name;
        // 获取缓存在浏览器中的球员预测结果数据，若无，返回null
        const localCache = JSON.parse(localStorage.getItem(playerOfpredictionResult));
        // 若能从缓存中读取到预测结果，就直接显示，否则发送请求到后端查询
        switch(itemIndex) {
            case 0: // 发送MVP预测
                // 检查缓存，如果有这个球员的mvp预测结果缓存，并且没有过期，直接读取
                if(localCache && localCache.mvp_percentage && localCache.expire >= new Date().getTime()) {
                    // 修改搜索状态为未搜索
                    this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                    this.props.percentage(localCache.mvp_percentage);
                } else { // 否则发送请求，并把请求结果缓存
                    let MVPprediction = Object.assign({}, playerStatistic);
                    MVPprediction.predPrize = 'mvp';
                    $axios.postRequest(URL.INPUT_DATA_TO_ALGORITHM, MVPprediction)
                        .then(res => {
                            // 修改搜索状态为未搜索
                            this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                            // 更新
                            this.props.percentage(res);
                        })
                        .catch(error => alert(error.message))
                }
                break;
            case 1: // 发送DPOY预测
                if(localCache && localCache.dpoy_percentage && localCache.expire >= new Date().getTime()) {
                    // 修改搜索状态为未搜索
                    this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                    this.props.percentage(localCache.dpoy_percentage);
                } else { // 否则发送请求，并把请求结果缓存
                    let DPOYprediction = Object.assign({}, playerStatistic);
                    DPOYprediction.predPrize = 'dpoy';
                    $axios.postRequest(URL.INPUT_DATA_TO_ALGORITHM, DPOYprediction)
                        .then(res => {
                            // 修改搜索状态为未搜索
                            this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                            // 缓存
                            let predictionResult = JSON.parse(localStorage.getItem(playerOfpredictionResult)) || {};
                            predictionResult.dpoy_percentage = res;
                            localStorage.setItem(playerOfpredictionResult, JSON.stringify(predictionResult));
                            // 更新
                            this.props.percentage(res);
                        })
                        .catch(error => alert(error.message))
                }
                break;
            case 2: // 发送MIP预测
                if(localCache && localCache.mip_percentage && localCache.expire >= new Date().getTime()) {
                    // 修改搜索状态为未搜索
                    this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                    this.props.percentage(localCache.mip_percentage);
                } else { // 否则发送请求，并把请求结果缓存
                    let MIPprediction = Object.assign({}, playerStatistic);
                    MIPprediction.predPrize = 'mip';
                    $axios.postRequest(URL.INPUT_DATA_TO_ALGORITHM, MIPprediction)
                        .then(res => {
                            // 修改搜索状态为未搜索
                            this.setState({ isPrediction: false, isSearchingIconOpacity: 0 });
                            // 缓存
                            let predictionResult = JSON.parse(localStorage.getItem(playerOfpredictionResult)) || {};
                            predictionResult.mip_percentage = res;
                            localStorage.setItem(playerOfpredictionResult, JSON.stringify(predictionResult));
                            // 更新
                            this.props.percentage(res);
                        })
                        .catch(error => alert(error.message))
                }
                break;
            default:
                break;
        }
    }

    render() {
        const { isSearchingIconOpacity } = this.state;
        const prizeItemArr = [
                                ['fas fa-trophy', 'MVP'], 
                                ['fas fa-shield-alt', 'DPOY'], 
                                ['fas fa-level-up-alt', 'MIP']
                            ];
        let itemList = [];
        for(let i = 0; i < prizeItemArr.length; i++) {
            itemList.push(
                <li 
                    key = { i }
                    className={ `prediction-left-bar-item ${this.state.currentIndex === i ? 'active' : ''}` }
                    index = { i }
                    onClick={ this.setCurrentIndex }
                >
                    <i className={ prizeItemArr[i][0] }></i>
                    <div className="prediction-prize">{ prizeItemArr[i][1] }</div>
                    <div className="left-string"></div>
                    <div className="prediction-active-Background"></div>
                </li>
            )
        }
        return (
            <div className="prediction-left-bar">
                <div className="prediction-left-bar-award">Awards Prediction</div>
                <div></div>
                <ul className="prediction-left-bar-menu">
                    { itemList }
                </ul>
                <div className="prediction-reminder" style={{ opacity: isSearchingIconOpacity }}>
                    <p>Please wait for the current prediction to be completed!!</p>
                    <i className="fas fa-bolt"></i>
                </div>
            </div>
        )
    }
}
