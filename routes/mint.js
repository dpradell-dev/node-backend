var express = require('express');
var router = express.Router();
const Openfort = require('@openfort/openfort-node').default;

/* POST mint endpoint */
router.post('/', async function(req, res, next) {
  
  const openfort = new Openfort("sk_test_fb63caae-68a7-59a8-af00-3a279ca925cb");
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = auth.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const player = await openfort.iam.verifyAuthToken(token);
    if (!player) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const policy_id = "0x51216BFCf37A1D2002A9F3290fe5037C744a6438";
    const contract_id = "pol_72cfd65c-37e8-480d-aa64-f460ec990fe4";
    const chainId = 11155111;

    const interaction_mint = {
      contract: contract_id,
      functionName: "mint",
      functionArgs: [player.playerId],
    };

    console.log("Creating transaction intent...");
    const transactionIntent = await openfort.transactionIntents.create({
      player: player.playerId,
      policy: policy_id,
      chainId,
      interactions: [interaction_mint],
    });

    console.log("Transaction intent created:", transactionIntent);
    return res.send({
      transactionIntentId: transactionIntent.id,
      userOperationHash: transactionIntent.userOperationHash,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
});

module.exports = router;