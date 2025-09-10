export class Check {
  static verifyEnvironment() {
    return process.env.PORT &&
      process.env.SENDGRID_API_KEY &&
      process.env.MAIL_FROM
      ? true
      : false;
  }
}
