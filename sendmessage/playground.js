
module.exports.add = () => {
  console.log("111111")
}

const a = () => {
  console.log("OK")
  module.exports.add()
}

a()
