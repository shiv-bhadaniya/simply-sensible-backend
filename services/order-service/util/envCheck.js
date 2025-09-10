export class Check {
  static verifyEnvironment() {
    return process.env.PORT &&
      process.env.DB_CONNECTION_URL &&
      process.env.PRODUCT_SERVICE_URL &&
      process.env.NOTIFICATION_SERVICE_URL
      ? true
      : false;
  }
}
