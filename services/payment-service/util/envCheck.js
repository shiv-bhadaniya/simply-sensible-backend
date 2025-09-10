export class Check {
  static verifyEnvironment() {
    return process.env.PORT &&
      process.env.STRIPE_API_KEY &&
      process.env.STRIPE_PUBLISHABLE_KEY &&
      process.env.FRONTEND_HOST
      ? true
      : false;
  }
}
