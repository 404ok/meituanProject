import fetch from 'node-fetch';
import Ids from '../models/ids'
import config from '../config'

export default class BaseClass {
  constructor() {
    this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'category_id', 'sku_id', 'admin_id', 'pay_id', 'comment_id'];
  }

  async fetch(url = '', data = {}, type = 'GET', resType = 'JSON') {
    type = type.toUpperCase();
    resType = resType.toUpperCase();
    if (type == 'GET') {
      let dataStr = ''; //数据拼接字符串
      Object.keys(data).forEach(key => {
        dataStr += key + '=' + data[key] + '&';
      
      });

      if (dataStr !== '') {
        dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
        url = url + '?' + dataStr;
      }
      console.log(url);
    }

    let requestConfig = {
      method: type,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }

    if (type == 'POST') {
      Object.defineProperty(requestConfig, 'body', {
        value: JSON.stringify(data)
      })
    }
    let responseJson;
    try {
      const response = await fetch(url, requestConfig);
      if (resType === 'TEXT') {
        responseJson = await response.text();
      } else {
        responseJson = await response.json();
      }
    } catch (err) {
      console.log('获取http数据失败', err);
      throw new Error(err)
    }
    return responseJson
  }

  //获取id列表
  async getId(type_id) {
    if (!this.idList.includes(type_id)) {
      throw new Error('id类型错误');
      return;
    }
    try {
      const idData = await Ids.findOneAndUpdate({}, { '$inc': { [type_id]: 1 } });
      return ++idData[type_id];                //返回当前类型id数量*/
    } catch (err) {
      console.log('获取ID数据失败');
      throw new Error(err)
    }
  }

  //根据ip定位定位  只能获取到经纬度和省份城市  不能获取到具体位置 还需要调用下面接口获取具体位置
  async getLocation(req, res, next) {
    // 通过请求头信息获取ip
    let ip = req.ip;  // 获取的是请求头中的ip，还需要进行数据处理
    const ipArr = ip.split(':');
    ip = ipArr[ipArr.length - 1];//切割字符串提取ip

    if (process.env.NODE_ENV == 'dev') {    //开发环境
      ip = '123.118.106.229';
    }

    try {
      // let getIpResult;
      // //添加的获取ip地址的方法
      // getIpResult = await this.fetch('https://ip.cn/api/index', {
      //   ip: "",
      //   type: 0,
      // }, 'GET');
      // if (getIpResult.ip) {
      //   ip = getIpResult.ip;
      // } else {
      //   res.send({
      //     status: -1,
      //     message: '获取ip地址的接口失败'
      //   })
      //   return;
      // }
      console.log("获取的地址是",ip);
      //ip = '123.118.106.229';
      let getResult = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
        ip: ip,
        key: config.tencentkey,
      }, 'GET');
      if (getResult.status !== 0) {
        getResult = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
          ip: ip,
          key: config.tencentkey2,
        }, 'GET')

      }
      console.log(
        "请求的地址",'http://apis.map.qq.com/ws/location/v1/ip',ip,config.tencentkey
      );
      if (getResult.status == 0) {
        const cityInfo = {
          lat: getResult.result.location.lat,    //纬度
          lng: getResult.result.location.lng,    //经度
          city: getResult.result.ad_info.city,
        };
        cityInfo.city = cityInfo.city.replace(/市$/, '');
        return cityInfo;
      } else {

        res.send({
          status: -1,
          message: '腾讯通过ip获取地址接口失败'
        })
        // 如果请求的接口都失败，返回默认地址
        return { lat: 40.22077, lng: 116.23128, city: '北京市' };
      }
    } catch (err) {
      res.send({
        status: -1,
        message: '定位方法内部报错'
      })
    }
  }

  //根据经纬度获取详细地址信息
  async getDetailPosition(location, res, successFn) {
    try {
      let cityInfo;
      if (location) {
        cityInfo = await this.fetch('http://apis.map.qq.com/ws/geocoder/v1', {
          location: location.lat + ',' + location.lng,
          key: config.tencentkey
        }, 'GET');
        if (cityInfo.status !== 0) {
          cityInfo = await this.fetch('http://apis.map.qq.com/ws/geocoder/v1', {
            location: location.lat + ',' + location.lng,
            key: config.tencentkey2
          }, 'GET');
        }
        if (cityInfo.status == 0) {
          let address = cityInfo.result.address.replace(/^.{2}省.{2}市/, '');
          successFn({
            address,
            location
          });
        } 

      }
    } catch (err) {
      res.send({
        status: -1,
        message: '获取定位失败'
      })
    }

  }

  //根据关键词搜索位置
  async locationSearch(keyword) {
    try {
      let reqData = {
        keyword: encodeURI(keyword),
        key: config.tencentkey,
        policy: 1
      }
      let data = await this.fetch('http://apis.map.qq.com/ws/place/v1/suggestion', reqData, "GET");
      console.log('http://apis.map.qq.com/ws/place/v1/suggestion',encodeURI(keyword),config.tencentkey,'policy')
      return data;
    } catch (err) {
      console.log('搜索位置出错', err);

    }
  }
}