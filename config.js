module.exports = {
    rabbitMQ: {
      url: "amqp://127.0.0.1:5672", // RabbitMQ server URL.
      exchangeName: "logExchange", //  The name of the exchange where logs will go first, then to queue
    },
};