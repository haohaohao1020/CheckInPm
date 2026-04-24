import { storage, showToast } from '@/utils'

const baseURL = '/api'

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = storage.get('token')
    
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data
          if (data.code === 200) {
            resolve(data)
          } else {
            showToast(data.message || '请求失败')
            if (data.code === 401) {
              storage.remove('token')
              storage.remove('userInfo')
              uni.redirectTo({
                url: '/pages/login/login'
              })
            }
            reject(new Error(data.message || '请求失败'))
          }
        } else {
          showToast('网络错误')
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        showToast('网络连接失败')
        reject(err)
      }
    })
  })
}

export const get = (url, data = {}) => {
  return request({
    url,
    method: 'GET',
    data
  })
}

export const post = (url, data = {}) => {
  return request({
    url,
    method: 'POST',
    data
  })
}

export default {
  get,
  post
}
