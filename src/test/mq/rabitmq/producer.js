const amqp = require("amqplib");

const message = "Hello rabbit mq phuc duong";

const runProducer = async () => {
  try {
    const connect = await amqp.connect("amqp://localhost");
    const channel = await connect.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });
    // send a message to consumer
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log({ message: message, queue: queueName });
  } catch (err) {
    console.log(err);
  }
};

runProducer().catch((err) => {
  console.log(err);
});
