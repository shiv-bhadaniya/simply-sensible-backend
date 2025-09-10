export class Check {
  static verifyEnvironment() {
    return process.env.PORT &&
      process.env.DB_CONNECTION_URL &&
      process.env.secretKey &&
      process.env.FRONTEND_HOST
      ? true
      : false;
  }
}
