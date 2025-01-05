const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connect = await amqp.connect("amqp://localhost"); // amqp://guest:@12345localhost neu doi pass
    const channel = await connect.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.consume(
      queueName,
      (message) => {
        console.log(`message receive ${message.content.toString()}`);
      },
      {
        noAck: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

runConsumer().catch((err) => {
  console.log(err);
});
