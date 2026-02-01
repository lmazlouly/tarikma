module.exports = (openApi) => {
  if (openApi && openApi.info && openApi.info.license) {
    delete openApi.info.license
  }
  return openApi
}
