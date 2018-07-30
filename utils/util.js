const formatTime = date => {
  let date_n = new Date(date);
  const year = date_n.getFullYear()
  const month = date_n.getMonth() + 1
  const day = date_n.getDate()
  const hour = date_n.getHours()
  const minute = date_n.getMinutes()
  const second = date_n.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}
