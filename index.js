const express = require('express');
const app = express();
const cors=require('cors')
const bodyParser = require('body-parser');
const stripe = require('stripe')('Your KEy')
app.use(bodyParser.json());
app.use(cors({
    origin:"*"
}))

app.post("/invoice",async (req,res)=>{
    console.log(req.body);
    const create_invoice = await stripe.invoices.create({
        customer: req.body.cus_id,
      });

      console.log(create_invoice);
    const invoice = await stripe.invoices.retrieve(
        create_invoice.id
      );
      res.send(invoice)
})

app.delete("/cancel/:id",async (req,res)=>{
 const result = await stripe.subscriptions.del(
    req.params.id
  );
  res.send(result)
})

app.post("/upgrade_or_downgrade",async (req,res)=>{
  const subscription = await stripe.subscriptions.retrieve(req.body.sub_id);
stripe.subscriptions.update(req.body.sub_id, {
  cancel_at_period_end: false,
  proration_behavior: 'create_prorations',
  items: [{
    id: subscription.items.data[0].id,
    price: 'price_CBb6IXqvTLXp3f',
  }]
});
})

app.get("/retriveSubscription/:id", async (req,res)=>{
console.log(req.params.id);
const subscription = await stripe.subscriptions.retrieve(
  req.params.id
);
res.send(subscription)
// console.log(subscription);
})
 
app.post("/checkout", async (req, res) => {
    console.log(req.body);
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send(session);
  });
app.post('/subscribe', async (req, res) => {
    console.log('body',req.body);
//   const { priceId } = req.body;

  // See https://stripe.com/docs/api/checkout/sessions/create
  // for additional parameters to pass.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
        //   price: priceId,
        price: req.body.data,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
      // the actual Session ID is returned in the query parameter when your customer
      // is redirected to the success page.
      success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/faliure',
    });
    console.log(session);

    // res.send(session)
    res.send({
      sessionId: session.id,
    //   sessionId: session,

    });
  } catch (e) {
    console.log("error",e);
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
});

app.listen(3000,()=>console.log("port running on 3000"))