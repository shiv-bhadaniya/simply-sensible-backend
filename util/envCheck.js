export class Check {
    static verifyEnvironment() {
        return (process.env.PORT && process.env.DB_CONNECTION_URL && process.env.STRIPE_API_KEY && process.env.secretKey) ? true : false;
    }
}
