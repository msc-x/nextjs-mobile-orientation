
// 自动设置本地IP
if (typeof window !== 'undefined' && localStorage) {
  localStorage.setItem('localNetworkIp', '192.168.1.9');
  console.log('本地网络IP已自动设置为:', '192.168.1.9');
}
  